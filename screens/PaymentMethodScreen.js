import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";
import * as Network from "expo-network";
import { savePendingBooking } from "../services/database";
import { checkNetworkStatus } from "../services/syncService";

export default function PaymentMethodScreen({ navigation, route }) {
  const { tour, contact, guests, totalAmount, option } = route.params;
  
  const [card, setCard] = useState({
    number: "",
    holder: "",
    exp: "",
    cvv: "",
  });
  
  const [isOnline, setIsOnline] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ KIỂM TRA MẠNG KHI VÀO SCREEN
  useEffect(() => {
    checkNetwork();
    
    const interval = setInterval(checkNetwork, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkNetwork = async () => {
    const online = await checkNetworkStatus();
    setIsOnline(online);
  };

  // ✅ XỬ LÝ THANH TOÁN OFFLINE
  const handleOfflinePayment = async () => {
    try {
      // Lưu vào SQLite
      await savePendingBooking({
        tour,
        contact,
        guests,
        totalAmount,
      });
      
      Alert.alert(
        "📴 Đã lưu booking offline",
        "Booking của bạn sẽ được đồng bộ tự động khi có kết nối mạng.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Main")
          }
        ]
      );
    } catch (error) {
      console.error("Offline booking error:", error);
      Alert.alert("Lỗi", "Không thể lưu booking offline");
    }
  };

  // ✅ XỬ LÝ THANH TOÁN ONLINE
  const handleOnlinePayment = async (isPayLater = false) => {
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
        Alert.alert("🕐 Thanh toán tạm giữ", "Bạn sẽ thanh toán sau.");
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
        payment_status: "success",
      });

      // Cập nhật checkout với booking_id
      await updateDoc(doc(db, "checkout", checkoutRef.id), {
        invoice_id: invoiceRef.id,
        booking_id: invoiceRef.id,
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

  // ✅ MAIN HANDLER
  const handlePayment = async (isPayLater = false) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (!isOnline) {
        // Offline mode
        await handleOfflinePayment();
      } else {
        // Online mode
        await handleOnlinePayment(isPayLater);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* NETWORK STATUS BANNER */}
        <View style={[
          styles.networkBanner,
          { backgroundColor: isOnline ? "#4CAF50" : "#FF9800" }
        ]}>
          <Ionicons
            name={isOnline ? "wifi" : "wifi-off"}
            size={20}
            color="#fff"
          />
          <Text style={styles.networkText}>
            {isOnline ? "🟢 Online" : "📴 Offline - Booking sẽ được lưu tạm"}
          </Text>
        </View>

        {/* TOUR INFO */}
        <View style={styles.tourCard}>
          <Text style={styles.tourTitle}>{tour.title}</Text>
          <Text style={styles.tourPrice}>
            {totalAmount.toLocaleString("vi-VN")} VNĐ
          </Text>
          <Text style={styles.guestsInfo}>
            Số khách: {guests.length} người
          </Text>
          {!isOnline && (
            <View style={styles.offlineNotice}>
              <Ionicons name="information-circle" size={16} color="#FF9800" />
              <Text style={styles.offlineText}>
                Booking sẽ tự động đồng bộ khi có mạng
              </Text>
            </View>
          )}
        </View>

        {/* PAYMENT FORM */}
        {isOnline && (
          <>
            <Text style={styles.sectionTitle}>Thông tin thẻ</Text>
            <TextInput
              style={styles.input}
              placeholder="Số thẻ"
              keyboardType="number-pad"
              value={card.number}
              onChangeText={(t) => setCard({ ...card, number: t })}
              editable={!isProcessing}
            />
            <TextInput
              style={styles.input}
              placeholder="Tên chủ thẻ"
              value={card.holder}
              onChangeText={(t) => setCard({ ...card, holder: t })}
              editable={!isProcessing}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Hạn thẻ (MM/YY)"
                value={card.exp}
                onChangeText={(t) => setCard({ ...card, exp: t })}
                editable={!isProcessing}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="CVV"
                value={card.cvv}
                secureTextEntry
                onChangeText={(t) => setCard({ ...card, cvv: t })}
                editable={!isProcessing}
              />
            </View>
          </>
        )}

        {/* CONFIRM BUTTON */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { 
              backgroundColor: isProcessing ? "#ccc" : "#4C67ED",
              opacity: isProcessing ? 0.6 : 1
            }
          ]}
          onPress={() => handlePayment(option !== "payNow")}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>
              {isOnline ? "Xác nhận và thanh toán" : "Lưu booking offline"}
            </Text>
          )}
        </TouchableOpacity>

        {!isOnline && (
          <View style={styles.offlineInfo}>
            <Ionicons name="cloud-upload-outline" size={24} color="#666" />
            <Text style={styles.offlineInfoText}>
              Booking sẽ được gửi lên server tự động khi có mạng trở lại
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  networkBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
  networkText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  tourCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    margin: 20,
    marginBottom: 10,
  },
  tourTitle: { fontWeight: "700", fontSize: 16 },
  tourPrice: { color: "#4C67ED", fontWeight: "700", marginTop: 4 },
  guestsInfo: { color: "#666", marginTop: 4 },
  offlineNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 8,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    gap: 6,
  },
  offlineText: {
    flex: 1,
    color: "#E65100",
    fontSize: 13,
  },
  sectionTitle: { 
    fontWeight: "700", 
    fontSize: 16, 
    marginVertical: 10,
    marginHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  confirmButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    marginHorizontal: 20,
  },
  confirmText: { color: "#fff", fontWeight: "600" },
  offlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  offlineInfoText: {
    flex: 1,
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
});