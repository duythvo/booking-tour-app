// screens/BookingDetailScreen.js
import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function BookingDetailScreen({ route }) {
  const { booking } = route.params;
  const navigation = useNavigation();
  const details = booking.details || {};

  // Chuyển Firestore timestamp hoặc Date/string sang string
  const formatDate = (ts) => {
    if (!ts) return "-";
    if (ts.seconds)
      return new Date(ts.seconds * 1000).toLocaleDateString("vi-VN");
    if (ts.toDate) return ts.toDate().toLocaleDateString("vi-VN");
    if (ts instanceof Date) return ts.toLocaleDateString("vi-VN");
    return ts; // string
  };

  // Tính tổng tiền dựa trên số khách
  const totalAmount =
    details.totalAmount ||
    (details.amount ? details.amount * (details.guests?.length || 1) : 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.header}>
          <Image
            source={{
              uri: details.tour_image || "https://via.placeholder.com/400",
            }}
            style={styles.coverImage}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{details.tour_title || "Tour"}</Text>

          {/* Thông tin đặt chỗ */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.infoText}>
              Ngày đặt: {formatDate(booking.date_issued)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#2e8b2e"
            />
            <Text
              style={[
                styles.infoText,
                {
                  color:
                    booking.payment_status === "success"
                      ? "#2e8b2e"
                      : "#d2691e",
                },
              ]}
            >
              {booking.payment_status === "success"
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </Text>
          </View>

          {/* Thông tin liên hệ */}
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <Text style={styles.detailText}>
            Họ và tên: {details.contact?.fullName || "-"}
          </Text>
          <Text style={styles.detailText}>
            Email: {details.contact?.email || "-"}
          </Text>
          <Text style={styles.detailText}>
            Số điện thoại: {details.contact?.phone || "-"}
          </Text>

          {/* Danh sách khách */}
          {details.guests && details.guests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Người đi</Text>
              {details.guests.map((guest, i) => (
                <View key={i} style={styles.guestItem}>
                  <Text style={styles.guestName}>{guest.name || "-"}</Text>
                  <Text style={styles.guestDob}>
                    Ngày sinh: {formatDate(guest.birth)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactBtn}>
          <Text style={styles.contactText}>Liên hệ hỗ trợ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { position: "relative" },
  coverImage: { width: "100%", height: 240 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 30,
  },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#222", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoText: { marginLeft: 8, fontSize: 15, color: "#555" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#222",
  },
  detailText: { fontSize: 15, color: "#555", marginBottom: 6 },
  guestItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  guestName: { fontWeight: "600", color: "#222" },
  guestDob: { color: "#777", fontSize: 13, marginTop: 2 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  contactBtn: {
    backgroundColor: "#4C67ED",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  contactText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
