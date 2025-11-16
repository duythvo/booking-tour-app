import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import BookingItem from "../components/BookingItem";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Lấy tất cả invoice và checkout
        const invoiceSnapshot = await getDocs(collection(db, "invoice"));
        const checkoutSnapshot = await getDocs(collection(db, "checkout"));

        // Tạo map checkout theo booking_id để dễ lookup trạng thái
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
          const status = checkoutMap[bookingId] || "pending";

          // Tính tổng tiền: tour_price * số khách
          const guestsCount = inv.details?.guests?.length || 1;
          const tourPrice = inv.details?.tour_price || inv.amount || 0;
          const totalAmount = tourPrice * guestsCount;

          // Chuyển timestamp sang Date
          const issuedDate = inv.date_issued?.toDate
            ? inv.date_issued.toDate()
            : inv.date_issued instanceof Date
            ? inv.date_issued
            : null;

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
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4C67ED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {bookings.length === 0 ? (
        <Text style={styles.empty}>Chưa có đặt chỗ nào.</Text>
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
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", color: "#222", marginBottom: 16 },
  empty: { textAlign: "center", color: "#999", fontSize: 16, marginTop: 50 },
});
