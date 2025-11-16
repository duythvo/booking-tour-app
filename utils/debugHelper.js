import { 
    getAllBookingsDebug, 
    countPendingBookings,
    clearAllBookings 
} from '../services/database';
import { checkNetworkStatus, syncAllPendingBookings } from '../services/syncService';
import { Alert } from 'react-native';

// ✅ Kiểm tra trạng thái sync
export const checkSyncStatus = async () => {
    try {
        console.log('=== SYNC STATUS CHECK ===');

        // 1. Kiểm tra mạng
        const isOnline = await checkNetworkStatus();
        console.log(`🌐 Network: ${isOnline ? 'ONLINE ✅' : 'OFFLINE ❌'}`);

        // 2. Kiểm tra số lượng pending
        const count = await countPendingBookings();
        console.log(`📊 Pending bookings: ${count}`);

        // 3. Xem chi tiết bookings
        const allBookings = await getAllBookingsDebug();
        console.log(`📋 All bookings in DB:`);
        allBookings.forEach(b => {
            console.log(`  - ID: ${b.id}, Status: ${b.sync_status}, Tour: ${b.tour_title}`);
        });

        return {
            isOnline,
            pendingCount: count,
            allBookings
        };

    } catch (error) {
        console.error('❌ Check status error:', error);
        return null;
    }
};

// ✅ Force sync ngay
export const forceSync = async () => {
    try {
        console.log('🔄 FORCE SYNC STARTING...');

        const status = await checkSyncStatus();
        if (!status) {
            Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái');
            return;
        }

        if (!status.isOnline) {
            Alert.alert('Offline', 'Không có kết nối mạng');
            return;
        }

        if (status.pendingCount === 0) {
            Alert.alert('Thông báo', 'Không có booking cần đồng bộ');
            return;
        }

        const result = await syncAllPendingBookings();

        if (result.success && result.results) {
            const msg = `
Đồng bộ hoàn tất:
✅ Thành công: ${result.results.success.length}
❌ Thất bại: ${result.results.failed.length}
            `.trim();

            Alert.alert('Kết quả', msg);
        } else {
            Alert.alert('Lỗi', result.message || 'Đồng bộ thất bại');
        }

    } catch (error) {
        console.error('❌ Force sync error:', error);
        Alert.alert('Lỗi', error.message);
    }
};

// ✅ Clear tất cả (testing only)
export const clearAllBookingsWithConfirm = () => {
    Alert.alert(
        'Xác nhận',
        'Xóa TẤT CẢ bookings trong SQLite?\n⚠️ Hành động này không thể hoàn tác!',
        [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await clearAllBookings();
                        Alert.alert('✅', 'Đã xóa tất cả bookings');
                    } catch (error) {
                        Alert.alert('Lỗi', error.message);
                    }
                }
            }
        ]
    );
};

// ✅ Kiểm tra Firebase connection
export const testFirebaseConnection = async () => {
    try {
        const { db } = require('../firebase');
        const { collection, getDocs, limit, query } = require('firebase/firestore');

        console.log('🔥 Testing Firebase connection...');

        const testQuery = query(collection(db, 'tours'), limit(1));
        const snapshot = await getDocs(testQuery);

        if (snapshot.empty) {
            console.log('⚠️ Firebase connected but no tours found');
        } else {
            console.log('✅ Firebase connected successfully');
        }

        return true;

    } catch (error) {
        console.error('❌ Firebase connection error:', error);
        Alert.alert('Firebase Error', error.message);
        return false;
    }
};

// ✅ Export tất cả
export default {
    checkSyncStatus,
    forceSync,
    clearAllBookingsWithConfirm,
    testFirebaseConnection
};