import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BookingItem({ item, onPress }) {
  const totalAmount = item.totalAmount || 0;

  const issuedDate = item.date_issued
    ? new Date(item.date_issued).toLocaleDateString("vi-VN")
    : "N/A";

  const isPaid = item.payment_status === "success";

  return (
    <TouchableOpacity
      style={styles.bookingCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image
        source={{
          uri: item.details?.tour_image || "https://via.placeholder.com/100",
        }}
        style={styles.tourImage}
      />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.details?.tour_title || "Tour không xác định"}
        </Text>

        <Text style={styles.date}>Ngày đặt: {issuedDate}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>
            {totalAmount.toLocaleString("vi-VN")} VNĐ
          </Text>

          <View
            style={[
              styles.statusBadge,
              isPaid
                ? { backgroundColor: "#e6f7e6" }
                : { backgroundColor: "#ffecec" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isPaid ? { color: "#2e8b2e" } : { color: "#cc0000" },
              ]}
            >
              {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookingCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tourImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: "600", color: "#222" },
  date: { fontSize: 13, color: "#777", marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  price: { fontSize: 16, fontWeight: "bold", color: "#003580" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "600" },
});
