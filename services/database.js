import * as SQLite from 'expo-sqlite';

let db = null;

// Khởi tạo database
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('bookings.db');
    
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
        created_at TEXT,
        sync_status TEXT DEFAULT 'pending'
      );
    `);
    
    console.log('Database initialized');
  } catch (error) {
    console.error('Database init error:', error);
  }
};

// Lưu booking offline
export const savePendingBooking = async (bookingData) => {
  try {
    const {
      tour,
      contact,
      guests,
      totalAmount
    } = bookingData;
    
    const result = await db.runAsync(
      `INSERT INTO pending_bookings (
        tour_id, tour_title, tour_price, tour_image,
        contact_name, contact_email, contact_phone,
        guests, total_amount, created_at, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tour.id,
        tour.title,
        tour.price,
        tour.images?.[0] || tour.image_url || '',
        contact.fullName,
        contact.email,
        contact.phone,
        JSON.stringify(guests),
        totalAmount,
        new Date().toISOString(),
        'pending'
      ]
    );
    
    console.log('Saved offline booking:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Save booking error:', error);
    throw error;
  }
};

// Lấy tất cả booking chờ đồng bộ
export const getPendingBookings = async () => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM pending_bookings WHERE sync_status = ?',
      ['pending']
    );
    
    return result.map(row => ({
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
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('❌ Get pending bookings error:', error);
    return [];
  }
};

// Cập nhật trạng thái sync
export const updateBookingStatus = async (id, status) => {
  try {
    await db.runAsync(
      'UPDATE pending_bookings SET sync_status = ? WHERE id = ?',
      [status, id]
    );
    console.log(`Updated booking ${id} to ${status}`);
  } catch (error) {
    console.error('Update status error:', error);
  }
};

// Xóa booking đã sync
export const deleteSyncedBooking = async (id) => {
  try {
    await db.runAsync(
      'DELETE FROM pending_bookings WHERE id = ?',
      [id]
    );
    console.log(`✅ Deleted booking ${id}`);
  } catch (error) {
    console.error('Delete booking error:', error);
  }
};

// Đếm số booking chờ đồng bộ
export const countPendingBookings = async () => {
  try {
    const result = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM pending_bookings WHERE sync_status = ?',
      ['pending']
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Count error:', error);
    return 0;
  }
};

// Xóa tất cả bookings (dùng để test)
export const clearAllBookings = async () => {
  try {
    await db.runAsync('DELETE FROM pending_bookings');
    console.log('✅ Cleared all bookings');
  } catch (error) {
    console.error('Clear error:', error);
  }
};