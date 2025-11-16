import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import BookingItem from "../components/BookingItem";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const user = auth.currentUser;

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ FIX 3: FETCH BOOKINGS CỦA USER
  const fetchBookings = async () => {
    try {
      if (!user) {
        console.log("User not logged in");
        setLoading(false);
        return;
      }

      // ✅ QUERY CHỈ LẤY INVOICE CỦA USER HIỆN TẠI
      const invoiceQuery = query(
        collection(db, "invoice"),
        where("userId", "==", user.uid)
      );

      const invoiceSnapshot = await getDocs(invoiceQuery);

      // ✅ LẤY CHECKOUT ĐỂ MATCH PAYMENT STATUS
      const checkoutSnapshot = await getDocs(collection(db, "checkout"));

      const checkoutMap = {};
      checkoutSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.booking_id) {
          checkoutMap[data.booking_id] = data.payment_status;
        }
      });

      // Map invoice + tính toán
      let invoices = invoiceSnapshot.docs.map((doc) => {
        const inv = doc.data();
        const bookingId = inv.booking_id || doc.id;
        const status = checkoutMap[bookingId] || inv.payment_status || "pending";

        // Tính tổng tiền
        const guestsCount = inv.details?.guests?.length || 1;
        const tourPrice = inv.details?.tour_price || inv.amount || 0;
        const totalAmount = tourPrice * guestsCount;

        // Chuyển timestamp sang Date
        const issuedDate = inv.date_issued?.toDate
          ? inv.date_issued.toDate()
          : inv.date_issued instanceof Date
            ? inv.date_issued
            : new Date();

        return {
          id: doc.id,
          ...inv,
          totalAmount,
          payment_status: status,
          date_issued: issuedDate,
        };
      });

      // Sắp xếp từ mới → cũ
      invoices.sort((a, b) => b.date_issued - a.date_issued);

      setBookings(invoices);
    } catch (error) {
      console.error("Lỗi khi tải đặt chỗ:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4C67ED" />
        <Text style={styles.loadingText}>Đang tải booking...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptyText}>
            Vui lòng đăng nhập để xem booking của bạn
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Chưa có đặt chỗ nào</Text>
          <Text style={styles.emptyText}>
            Các booking của bạn sẽ hiển thị ở đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingItem
              item={item}
              onPress={() =>
                navigation.navigate("BookingDetail", { booking: item })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4C67ED"]}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Booking của tôi ({bookings.length})
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9"
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 15,
    lineHeight: 22,
  },
});