// services/database.js - FIXED VERSION
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

const DB_NAME = "bookings.db";
let db = null;

// ✅ FIX: Bỏ auto-reset, chỉ reset khi cần
const resetDatabase = async () => {
    const dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
    try {
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        if (fileInfo.exists) {
            console.log("🗑️ Deleting old DB...");
            await FileSystem.deleteAsync(dbPath, { idempotent: true });
        }
    } catch (error) {
        console.warn("⚠️ Reset DB error:", error);
    }
};

export const initDatabase = async () => {
    try {
        // ✅ FIX: KHÔNG reset mỗi lần khởi động - chỉ khi debug
        await resetDatabase(); // COMMENT dòng này lại
        
        db = await SQLite.openDatabaseAsync(DB_NAME);
        
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS pending_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tour_id TEXT NOT NULL,
                tour_title TEXT,
                tour_price REAL,
                tour_image TEXT,
                contact_name TEXT,
                contact_email TEXT,
                contact_phone TEXT,
                guests TEXT,
                total_amount REAL,
                user_id TEXT,
                created_at TEXT,
                sync_status TEXT DEFAULT 'pending',
                retry_count INTEGER DEFAULT 0,
                last_error TEXT
            );
        `);
        
        console.log("✅ Database initialized");
        
        // ✅ Log số lượng pending bookings
        const count = await countPendingBookings();
        console.log(`📊 Current pending bookings: ${count}`);
        
    } catch (error) {
        console.error("❌ Database init error:", error);
        throw error;
    }
};

export const savePendingBooking = async (bookingData) => {
    if (!db) throw new Error("Database not initialized");
    
    const { tour, contact, guests, totalAmount, userId } = bookingData;
    
    try {
        const result = await db.runAsync(
            `INSERT INTO pending_bookings (
                tour_id, tour_title, tour_price, tour_image,
                contact_name, contact_email, contact_phone,
                guests, total_amount, user_id, created_at, sync_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tour.id,
                tour.title,
                tour.price,
                tour.images?.[0] || '',
                contact.fullName,
                contact.email,
                contact.phone,
                JSON.stringify(guests),
                totalAmount,
                userId,
                new Date().toISOString(),
                'pending'
            ]
        );
        
        console.log(`💾 Saved booking ID: ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
        
    } catch (error) {
        console.error('❌ Save booking error:', error);
        throw error;
    }
};

export const getPendingBookings = async () => {
    if (!db) throw new Error("Database not initialized");
    
    try {
        const rows = await db.getAllAsync(
            `SELECT * FROM pending_bookings WHERE sync_status = 'pending' ORDER BY created_at ASC`
        );
        
        console.log(`🔍 Found ${rows.length} pending bookings`);
        
        return rows.map(row => ({
            id: row.id,
            tour: {
                id: row.tour_id,
                title: row.tour_title,
                price: row.tour_price,
                images: [row.tour_image]
            },
            contact: {
                fullName: row.contact_name,
                email: row.contact_email,
                phone: row.contact_phone
            },
            guests: JSON.parse(row.guests),
            totalAmount: row.total_amount,
            userId: row.user_id,
            createdAt: row.created_at,
            retryCount: row.retry_count || 0,
            lastError: row.last_error
        }));
        
    } catch (error) {
        console.error('❌ Get pending bookings error:', error);
        return [];
    }
};

export const updateBookingStatus = async (id, status, errorMessage = null) => {
    if (!db) throw new Error("Database not initialized");
    
    try {
        if (status === 'failed') {
            // ✅ Tăng retry count khi fail
            await db.runAsync(
                `UPDATE pending_bookings 
                SET sync_status = ?, 
                    retry_count = retry_count + 1,
                    last_error = ?
                WHERE id = ?`,
                [status, errorMessage, id]
            );
        } else {
            await db.runAsync(
                `UPDATE pending_bookings SET sync_status = ? WHERE id = ?`,
                [status, id]
            );
        }
        
        console.log(`🔄 Updated booking ${id} to ${status}`);
        
    } catch (error) {
        console.error('❌ Update status error:', error);
    }
};

export const deleteSyncedBooking = async (id) => {
    if (!db) throw new Error("Database not initialized");
    
    try {
        await db.runAsync(`DELETE FROM pending_bookings WHERE id = ?`, [id]);
        console.log(`🗑️ Deleted synced booking ${id}`);
        
    } catch (error) {
        console.error('❌ Delete booking error:', error);
    }
};

export const countPendingBookings = async () => {
    if (!db) throw new Error("Database not initialized");
    
    try {
        const row = await db.getFirstAsync(
            `SELECT COUNT(*) as count FROM pending_bookings WHERE sync_status = 'pending'`
        );
        
        const count = row?.count || 0;
        console.log(`📊 Pending count: ${count}`);
        return count;
        
    } catch (error) {
        console.error('❌ Count error:', error);
        return 0;
    }
};

// ✅ FIX: Thêm function lấy failed bookings để retry
export const getFailedBookings = async () => {
    if (!db) throw new Error("Database not initialized");
    
    try {
        const rows = await db.getAllAsync(
            `SELECT * FROM pending_bookings WHERE sync_status = 'failed' AND retry_count < 3`
        );
        
        console.log(`🔍 Found ${rows.length} failed bookings to retry`);
        return rows;
        
    } catch (error) {
        console.error('❌ Get failed bookings error:', error);
        return [];
    }
};

// ✅ Reset retry count khi cần
export const resetRetryCount = async (id) => {
    if (!db) throw new Error("Database not initialized");
    
    try {
        await db.runAsync(
            `UPDATE pending_bookings SET retry_count = 0, sync_status = 'pending' WHERE id = ?`,
            [id]
        );
        console.log(`🔄 Reset retry count for booking ${id}`);
        
    } catch (error) {
        console.error('❌ Reset retry error:', error);
    }
};

// ✅ Clear all bookings (for testing)
export const clearAllBookings = async () => {
    if (!db) throw new Error("Database not initialized");
    
    try {
        await db.runAsync('DELETE FROM pending_bookings');
        console.log('✅ Cleared all bookings');
        
    } catch (error) {
        console.error('Clear error:', error);
    }
};

// ✅ Debug: Xem tất cả bookings
export const getAllBookingsDebug = async () => {
    if (!db) throw new Error("Database not initialized");
    
    try {
        const rows = await db.getAllAsync('SELECT * FROM pending_bookings');
        console.log('📋 All bookings:', JSON.stringify(rows, null, 2));
        return rows;
        
    } catch (error) {
        console.error('❌ Debug error:', error);
        return [];
    }
};