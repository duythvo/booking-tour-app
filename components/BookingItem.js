import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BookingItem({ item, onPress }) {
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
          {item.details?.tour_title || "Unknown Tour"}
        </Text>

        <Text style={styles.date}>
          Booked on:{" "}
          {item.date_issued
            ? new Date(item.date_issued.seconds * 1000).toLocaleDateString()
            : "N/A"}
        </Text>

        <View style={styles.row}>
          <Text style={styles.price}>${item.amount}</Text>

          <View
            style={[
              styles.statusBadge,
              item.payment_status === "success"
                ? { backgroundColor: "#e6f7e6" }
                : { backgroundColor: "#ffecec" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.payment_status === "success"
                  ? { color: "#2e8b2e" }
                  : { color: "#cc0000" },
              ]}
            >
              {item.payment_status === "success" ? "Paid" : "Pending"}
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
});
