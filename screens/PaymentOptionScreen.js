import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentOptionScreen({ navigation, route }) {
  const { tour, contact, guests, totalAmount } = route.params;
  const [option, setOption] = useState("payNow");

  const handleNext = () => {
    navigation.navigate("PaymentMethod", {
      tour,
      contact,
      guests,
      totalAmount,
      option,
    });
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

        <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

        <TouchableOpacity
          style={[
            styles.optionCard,
            option === "payLater" && styles.selectedCard,
          ]}
          onPress={() => setOption("payLater")}
        >
          <Ionicons
            name={
              option === "payLater" ? "radio-button-on" : "radio-button-off"
            }
            size={20}
            color="#4C67ED"
          />
          <Text style={styles.optionText}>Đặt trước, thanh toán sau</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            option === "payNow" && styles.selectedCard,
          ]}
          onPress={() => setOption("payNow")}
        >
          <Ionicons
            name={option === "payNow" ? "radio-button-on" : "radio-button-off"}
            size={20}
            color="#4C67ED"
          />
          <Text style={styles.optionText}>Đặt và thanh toán ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButton} onPress={handleNext}>
          <Text style={styles.confirmText}>Xác nhận và thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  tourCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  tourTitle: { fontWeight: "700", fontSize: 16 },
  tourPrice: { color: "#4C67ED", fontWeight: "700", marginTop: 4 },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 10 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  selectedCard: { borderColor: "#4C67ED", backgroundColor: "#f0f3ff" },
  optionText: { marginLeft: 10, fontSize: 15, color: "#333" },
  confirmButton: {
    backgroundColor: "#4C67ED",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  confirmText: { color: "#fff", fontWeight: "600" },
});
