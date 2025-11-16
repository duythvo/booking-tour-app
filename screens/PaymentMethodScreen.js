// screens/PaymentMethodScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import uuid from "react-native-uuid";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentMethodScreen({ navigation, route }) {
  const { tour, contact, guests, totalAmount, option } = route.params;
  const [card, setCard] = useState({
    number: "",
    holder: "",
    exp: "",
    cvv: "",
  });

  const handlePayment = async (isPayLater = false) => {
    try {
      if (guests.length > tour.remaining) {
        Alert.alert("Lỗi", `Chỉ còn ${tour.remaining} chỗ trống`);
        return;
      }

      const transactionId = uuid.v4();

      // Cập nhật số lượng còn lại
      const tourRef = doc(db, "tours", tour.id);
      await updateDoc(tourRef, { remaining: tour.remaining - guests.length });

      // Lưu checkout
      const checkoutRef = await addDoc(collection(db, "checkout"), {
        amount: totalAmount,
        payment_date: serverTimestamp(),
        payment_method: isPayLater ? "paylater" : "card",
        payment_status: isPayLater ? "pending" : "success",
        transaction_id: transactionId,
      });

      // Nếu trả sau thì chỉ lưu checkout
      if (isPayLater) {
        Alert.alert("🕓 Thanh toán tạm giữ", "Bạn sẽ thanh toán sau.");
        navigation.navigate("Main");
        return;
      }

      // Tạo invoice
      const invoiceRef = await addDoc(collection(db, "invoice"), {
        amount: totalAmount,
        date_issued: serverTimestamp(),
        details: {
          tour_title: tour.title,
          tour_image: tour.images?.[0] || tour.image_url,
          contact,
          guests,
          tour_price: tour.price,
        },
        checkout_id: checkoutRef.id,
        payment_status: "success", // lưu luôn trạng thái vào invoice
      });

      // Cập nhật checkout để có booking_id
      await updateDoc(doc(db, "checkout", checkoutRef.id), {
        invoice_id: invoiceRef.id,
        booking_id: invoiceRef.id, // để map checkoutMap trong MyBookingsScreen
      });

      Alert.alert(
        "✅ Thanh toán thành công",
        "Hóa đơn đã được tạo thành công!"
      );
      navigation.navigate("Main");
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("❌ Lỗi", "Không thể thực hiện thanh toán");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.tourCard}>
          <Text style={styles.tourTitle}>{tour.title}</Text>
          <Text style={styles.tourPrice}>
            {totalAmount.toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Thông tin thẻ</Text>
        <TextInput
          style={styles.input}
          placeholder="Số thẻ"
          keyboardType="number-pad"
          value={card.number}
          onChangeText={(t) => setCard({ ...card, number: t })}
        />
        <TextInput
          style={styles.input}
          placeholder="Tên chủ thẻ"
          value={card.holder}
          onChangeText={(t) => setCard({ ...card, holder: t })}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Hạn thẻ (MM/YY)"
            value={card.exp}
            onChangeText={(t) => setCard({ ...card, exp: t })}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="CVV"
            value={card.cvv}
            secureTextEntry
            onChangeText={(t) => setCard({ ...card, cvv: t })}
          />
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: "#4C67ED" }]}
          onPress={() => handlePayment(option !== "payNow")}
        >
          <Text style={styles.confirmText}>Xác nhận và thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  tourCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  tourTitle: { fontWeight: "700", fontSize: 16 },
  tourPrice: { color: "#4C67ED", fontWeight: "700", marginTop: 4 },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  confirmButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  confirmText: { color: "#fff", fontWeight: "600" },
});
