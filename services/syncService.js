import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
    serverTimestamp,
    runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
    getPendingBookings,
    updateBookingStatus,
    deleteSyncedBooking,
    getFailedBookings,
} from './database';
import * as Network from 'expo-network';

// ✅ FIX: Kiểm tra mạng với timeout và retry
export const checkNetworkStatus = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const networkState = await Network.getNetworkStateAsync();
        clearTimeout(timeoutId);

        const isConnected = networkState.isConnected === true;
        const isReachable = networkState.isInternetReachable === true;

        console.log(`🌐 Network: connected=${isConnected}, reachable=${isReachable}`);
        return isConnected && isReachable;

    } catch (error) {
        console.error('❌ Network check error:', error);
        return false;
    }
};

// ✅ FIX: Kiểm tra tour với transaction
const checkTourAvailability = async (tourId, requestedGuests) => {
    try {
        const tourRef = doc(db, 'tours', tourId);
        const tourSnap = await getDoc(tourRef);

        if (!tourSnap.exists()) {
            return { available: false, reason: 'Tour không tồn tại' };
        }

        const tour = tourSnap.data();
        const remaining = tour.remaining ?? 0;

        console.log(`🎫 Tour ${tourId}: remaining=${remaining}, requested=${requestedGuests}`);

        if (remaining < requestedGuests) {
            return {
                available: false,
                reason: `Chỉ còn ${remaining} chỗ, bạn đặt ${requestedGuests} người`,
                remaining,
            };
        }

        return { available: true, remaining };

    } catch (error) {
        console.error('❌ Check availability error:', error);
        return { available: false, reason: 'Lỗi kiểm tra số lượng: ' + error.message };
    }
};

// ✅ FIX: Sync với transaction để tránh race condition
const syncSingleBooking = async (booking) => {
    try {
        console.log(`🔄 Starting sync for booking ${booking.id}...`);

        const guestsCount = booking.guests.length;

        // Kiểm tra availability
        const availability = await checkTourAvailability(booking.tour.id, guestsCount);
        if (!availability.available) {
            console.log(`❌ Tour not available: ${availability.reason}`);
            await updateBookingStatus(booking.id, 'failed', availability.reason);
            return { success: false, bookingId: booking.id, reason: availability.reason };
        }

        // ✅ Dùng transaction để đảm bảo atomic
        const result = await runTransaction(db, async (transaction) => {
            const tourRef = doc(db, 'tours', booking.tour.id);
            const tourSnap = await transaction.get(tourRef);

            if (!tourSnap.exists()) {
                throw new Error('Tour không tồn tại');
            }

            const currentRemaining = tourSnap.data().remaining ?? 0;
            if (currentRemaining < guestsCount) {
                throw new Error(`Không đủ chỗ: còn ${currentRemaining}, cần ${guestsCount}`);
            }

            // Cập nhật remaining
            transaction.update(tourRef, {
                remaining: currentRemaining - guestsCount
            });

            // Tạo checkout
            const checkoutRef = doc(collection(db, 'checkout'));
            transaction.set(checkoutRef, {
                amount: booking.totalAmount,
                payment_date: serverTimestamp(),
                payment_method: 'offline',
                payment_status: 'pending',
                transaction_id: `offline_${Date.now()}_${booking.id}`,
                userId: booking.userId,
            });

            // Tạo invoice
            const invoiceRef = doc(collection(db, 'invoice'));
            transaction.set(invoiceRef, {
                amount: booking.totalAmount,
                date_issued: serverTimestamp(),
                details: {
                    tour_title: booking.tour.title,
                    tour_image: booking.tour.images?.[0] || '',
                    contact: booking.contact,
                    guests: booking.guests,
                    tour_price: booking.tour.price,
                },
                checkout_id: checkoutRef.id,
                payment_status: 'pending',
                userId: booking.userId,
            });

            // Cập nhật checkout với invoice_id
            transaction.update(checkoutRef, {
                invoice_id: invoiceRef.id,
                booking_id: invoiceRef.id,
            });

            return { checkoutId: checkoutRef.id, invoiceId: invoiceRef.id };
        });

        console.log(`✅ Transaction complete: ${result.invoiceId}`);

        // Xóa khỏi SQLite
        await deleteSyncedBooking(booking.id);

        return {
            success: true,
            bookingId: booking.id,
            tourTitle: booking.tour.title,
            invoiceId: result.invoiceId
        };

    } catch (error) {
        console.error(`❌ Sync error for booking ${booking.id}:`, error);
        await updateBookingStatus(booking.id, 'failed', error.message);
        return {
            success: false,
            bookingId: booking.id,
            reason: error.message || 'Lỗi không xác định',
        };
    }
};

// ✅ FIX: Sync tất cả với better error handling
export const syncAllPendingBookings = async () => {
    try {
        console.log('🔄 Starting sync process...');

        const isOnline = await checkNetworkStatus();
        if (!isOnline) {
            console.log('❌ No internet connection');
            return { success: false, message: 'Không có kết nối mạng' };
        }

        const pendingBookings = await getPendingBookings();
        if (pendingBookings.length === 0) {
            console.log('✅ No bookings to sync');
            return { success: true, message: 'Không có booking cần đồng bộ', synced: 0 };
        }

        console.log(`📋 Found ${pendingBookings.length} pending bookings`);

        const results = {
            total: pendingBookings.length,
            success: [],
            failed: []
        };

        for (const booking of pendingBookings) {
            // Kiểm tra mạng trước mỗi booking
            const stillOnline = await checkNetworkStatus();
            if (!stillOnline) {
                console.log('❌ Lost connection during sync');
                results.failed.push({
                    bookingId: booking.id,
                    reason: 'Mất kết nối'
                });
                break; // Dừng sync nếu mất mạng
            }

            console.log(`🔄 Syncing booking ${booking.id}...`);
            const result = await syncSingleBooking(booking);

            if (result.success) {
                results.success.push(result);
                console.log(`✅ Synced booking ${booking.id}`);
            } else {
                results.failed.push(result);
                console.log(`❌ Failed booking ${booking.id}: ${result.reason}`);
            }

            // Delay giữa các request
            await new Promise((r) => setTimeout(r, 1000));
        }

        // ✅ Retry failed bookings (max 1 lần)
        if (results.failed.length > 0) {
            console.log(`🔄 Retrying ${results.failed.length} failed bookings...`);

            for (const failed of [...results.failed]) {
                const booking = pendingBookings.find((b) => b.id === failed.bookingId);
                if (booking && booking.retryCount < 3) {
                    console.log(`🔄 Retry attempt for booking ${booking.id}`);
                    const retry = await syncSingleBooking(booking);

                    if (retry.success) {
                        results.success.push(retry);
                        results.failed = results.failed.filter((f) => f.bookingId !== failed.bookingId);
                        console.log(`✅ Retry successful for booking ${booking.id}`);
                    }
                }

                await new Promise((r) => setTimeout(r, 1000));
            }
        }

        console.log(`✅ Sync complete: ${results.success.length} success, ${results.failed.length} failed`);
        return { success: true, results };

    } catch (error) {
        console.error('❌ Sync all error:', error);
        return { success: false, message: error.message };
    }
};

// ✅ FIX: Auto sync với better timing
export const startAutoSync = (onSyncComplete) => {
    let syncInterval = null;
    let isSyncing = false;
    let lastSyncTime = 0;

    const performSync = async () => {
        if (isSyncing) {
            console.log('⏳ Sync already in progress, skipping...');
            return;
        }

        // ✅ Tránh sync quá thường xuyên (min 30s)
        const now = Date.now();
        if (now - lastSyncTime < 30000) {
            console.log('⏳ Too soon since last sync, skipping...');
            return;
        }

        isSyncing = true;
        lastSyncTime = now;

        try {
            console.log('🔄 Auto sync started...');

            const isOnline = await checkNetworkStatus();
            if (!isOnline) {
                console.log('❌ Offline, skipping sync');
                return;
            }

            const result = await syncAllPendingBookings();

            if (onSyncComplete && result.results) {
                const hasUpdates = result.results.success.length > 0 || result.results.failed.length > 0;
                if (hasUpdates) {
                    console.log('📢 Notifying sync complete');
                    onSyncComplete(result);
                }
            }

        } catch (error) {
            console.error('❌ Auto sync error:', error);
        } finally {
            isSyncing = false;
        }
    };

    // ✅ Sync ngay khi bắt đầu
    performSync();

    // ✅ Sync mỗi 60s (tăng từ 30s để giảm load)
    syncInterval = setInterval(performSync, 60000);

    // ✅ Return cleanup function
    return () => {
        if (syncInterval) {
            clearInterval(syncInterval);
            console.log('🛑 Auto sync stopped');
        }
    };
};

// ✅ Manual sync button
export const manualSync = async () => {
    try {
        console.log('🔄 Manual sync triggered');
        const result = await syncAllPendingBookings();
        return result;

    } catch (error) {
        console.error('❌ Manual sync error:', error);
        return { success: false, message: error.message };
    }
};