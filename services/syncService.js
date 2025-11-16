import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  getPendingBookings,
  updateBookingStatus,
  deleteSyncedBooking,
} from './database';
import * as Network from 'expo-network';

export const checkNetworkStatus = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected && networkState.isInternetReachable;
  } catch (error) {
    console.error('Network check error:', error);
    return false;
  }
};

const checkTourAvailability = async (tourId, requestedGuests) => {
  try {
    const tourRef = doc(db, 'tours', tourId);
    const tourSnap = await getDoc(tourRef);
    
    if (!tourSnap.exists()) {
      return { available: false, reason: 'Tour không tồn tại' };
    }
    
    const tour = tourSnap.data();
    const remaining = tour.remaining || 0;
    
    if (remaining < requestedGuests) {
      return {
        available: false,
        reason: `Chỉ còn ${remaining} chỗ, bạn đặt ${requestedGuests} người`,
        remaining
      };
    }
    
    return { available: true, remaining };
  } catch (error) {
    console.error('Check availability error:', error);
    return { available: false, reason: 'Lỗi kiểm tra số lượng' };
  }
};

const syncSingleBooking = async (booking) => {
  try {
    const guestsCount = booking.guests.length;
    
    // Kiểm tra số lượng
    const availability = await checkTourAvailability(
      booking.tour.id,
      guestsCount
    );
    
    if (!availability.available) {
      console.log(`❌ Booking ${booking.id} - ${availability.reason}`);
      await updateBookingStatus(booking.id, 'failed');
      return {
        success: false,
        bookingId: booking.id,
        reason: availability.reason
      };
    }
    
    // Cập nhật remaining
    const tourRef = doc(db, 'tours', booking.tour.id);
    await updateDoc(tourRef, {
      remaining: availability.remaining - guestsCount
    });
    
    // Tạo checkout
    const checkoutRef = await addDoc(collection(db, 'checkout'), {
      amount: booking.totalAmount,
      payment_date: serverTimestamp(),
      payment_method: 'offline',
      payment_status: 'pending',
      transaction_id: `offline_${Date.now()}`,
    });
    
    // Tạo invoice
    const invoiceRef = await addDoc(collection(db, 'invoice'), {
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
    });
    
    // Update checkout với booking_id
    await updateDoc(doc(db, 'checkout', checkoutRef.id), {
      invoice_id: invoiceRef.id,
      booking_id: invoiceRef.id,
    });
    
    // Xóa khỏi SQLite
    await deleteSyncedBooking(booking.id);
    
    console.log(`✅ Synced booking ${booking.id}`);
    return {
      success: true,
      bookingId: booking.id,
      tourTitle: booking.tour.title
    };
    
  } catch (error) {
    console.error(`❌ Sync error for booking ${booking.id}:`, error);
    await updateBookingStatus(booking.id, 'failed');
    return {
      success: false,
      bookingId: booking.id,
      reason: error.message
    };
  }
};

export const syncAllPendingBookings = async () => {
  try {
    // Kiểm tra mạng
    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      return {
        success: false,
        message: 'Không có kết nối mạng'
      };
    }
    
    // Lấy danh sách chờ đồng bộ
    const pendingBookings = await getPendingBookings();
    
    if (pendingBookings.length === 0) {
      return {
        success: true,
        message: 'Không có booking cần đồng bộ',
        synced: 0
      };
    }
    
    console.log(`🔄 Bắt đầu đồng bộ ${pendingBookings.length} booking...`);
    
    const results = {
      total: pendingBookings.length,
      success: [],
      failed: []
    };
    
    // Đồng bộ từng booking
    for (const booking of pendingBookings) {
      const result = await syncSingleBooking(booking);
      
      if (result.success) {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }
    }
    
    console.log(`✅ Đồng bộ xong: ${results.success.length}/${results.total}`);
    
    return {
      success: true,
      results
    };
    
  } catch (error) {
    console.error('❌ Sync all error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

export const startAutoSync = (onSyncComplete) => {
  let syncInterval = null;
  
  const sync = async () => {
    const isOnline = await checkNetworkStatus();
    if (!isOnline) return;
    
    const result = await syncAllPendingBookings();
    if (onSyncComplete) {
      onSyncComplete(result);
    }
  };
  
  // Đồng bộ ngay lập tức
  sync();
  
  // Đồng bộ mỗi 30 giây
  syncInterval = setInterval(sync, 30000);
  
  return () => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
  };
};