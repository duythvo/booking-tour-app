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
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import uuid from "react-native-uuid";

export default function PaymentMethodScreen({ navigation, route }) {
  const { tour, contact, guests, booking_id } = route.params;
  const [card, setCard] = useState({
    number: "",
    holder: "",
    exp: "",
    cvv: "",
  });

  const handlePayment = async (isPayLater = false) => {
    try {
      const amount = tour.price || 299;
      const transactionId = uuid.v4();

      // 1️⃣ Lưu vào collection "checkout"
      const checkoutRef = await addDoc(collection(db, "checkout"), {
        amount: amount,
        payment_date: serverTimestamp(),
        payment_method: isPayLater ? "paylater" : "card",
        payment_status: isPayLater ? "failed" : "success",
        transaction_id: transactionId,
        booking_id: booking_id || "N/A",
      });

      // Nếu trả sau thì không tạo invoice
      if (isPayLater) {
        Alert.alert(
          "🕓 Payment Pending",
          "Your payment will be processed later."
        );
        navigation.navigate("Main");
        return;
      }

      // 2️⃣ Nếu thanh toán thành công → tạo invoice
      const invoiceRef = await addDoc(collection(db, "invoice"), {
        amount: amount,
        date_issued: serverTimestamp(),
        details: {
          tour_title: tour.title,
          contact,
          guests,
        },
        booking_id: booking_id || "N/A",
        checkout_id: checkoutRef.id,
      });

      // 3️⃣ Cập nhật lại checkout để lưu liên kết invoice_id
      await updateDoc(doc(db, "checkout", checkoutRef.id), {
        invoice_id: invoiceRef.id,
      });

      Alert.alert("✅ Payment Success", "Invoice has been created successfully!");
      navigation.navigate("Main");
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("❌ Error", "Failed to process payment");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={22}
          color="#000"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Payment Method</Text>
      </View>

      <View style={styles.tourCard}>
        <Text style={styles.tourTitle}>{tour.title}</Text>
        <Text style={styles.tourPrice}>Total: ${tour.price || 299}</Text>
      </View>

      <Text style={styles.sectionTitle}>Card Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Card Number"
        keyboardType="number-pad"
        value={card.number}
        onChangeText={(t) => setCard({ ...card, number: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Card Holder Name"
        value={card.holder}
        onChangeText={(t) => setCard({ ...card, holder: t })}
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Exp Date (MM/YY)"
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

      <View style={styles.paymentOptions}>
        <Text style={styles.sectionTitle}>Or Pay With</Text>
        <View style={styles.iconRow}>
          <FontAwesome name="paypal" size={30} color="#0070ba" />
          <FontAwesome name="apple" size={30} color="#000" />
          <FontAwesome name="google" size={30} color="#db4437" />
        </View>
      </View>

      {/* ✅ Pay Now */}
      <TouchableOpacity
        style={[styles.confirmButton, { backgroundColor: "#4C67ED" }]}
        onPress={() => handlePayment(false)}
      >
        <Text style={styles.confirmText}>Confirm And Pay</Text>
      </TouchableOpacity>

      {/* 🕓 Pay Later */}
      <TouchableOpacity
        style={[styles.confirmButton, { backgroundColor: "#888" }]}
        onPress={() => handlePayment(true)}
      >
        <Text style={styles.confirmText}>Pay Later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: "600", marginLeft: 10 },
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
  paymentOptions: { marginTop: 10 },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  confirmButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  confirmText: { color: "#fff", fontWeight: "600" },
});
