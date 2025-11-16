import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function BookingScreen({ navigation, route }) {
  const { tour } = route.params;
  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [guests, setGuests] = useState([{ name: "", birth: new Date() }]);
  const [showDatePicker, setShowDatePicker] = useState({
    visible: false,
    index: null,
  });

  const addGuest = () => {
    if (guests.length >= tour.remaining) {
      Alert.alert("Lỗi", `Chỉ còn ${tour.remaining} chỗ trống`);
      return;
    }
    setGuests([...guests, { name: "", birth: new Date() }]);
  };

  const removeGuest = () => {
    if (guests.length > 1) setGuests(guests.slice(0, -1));
  };

  const showPicker = (index) => setShowDatePicker({ visible: true, index });
  const onDateChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowDatePicker({ visible: false, index: null });
      return;
    }
    const arr = [...guests];
    arr[showDatePicker.index].birth =
      selectedDate || arr[showDatePicker.index].birth;
    setGuests(arr);
    setShowDatePicker({ visible: false, index: null });
  };

  const handleNext = () => {
    // Validate contact
    if (
      !contact.fullName.trim() ||
      !contact.email.trim() ||
      !contact.phone.trim()
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin liên hệ");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(contact.phone.replace(/\s/g, ""))) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ (10-15 chữ số)");
      return;
    }

    // Validate guests
    for (let i = 0; i < guests.length; i++) {
      if (!guests[i].name.trim() || !guests[i].birth) {
        Alert.alert(
          "Lỗi",
          `Vui lòng nhập đầy đủ thông tin cho người đi ${i + 1}`
        );
        return;
      }
    }

    const totalAmount = tour.price * guests.length;
    navigation.navigate("PaymentOption", {
      tour,
      contact,
      guests,
      totalAmount,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={80}
      >
        <ScrollView style={styles.container}>
          <View style={styles.tourCard}>
            <Text style={styles.tourTitle}>{tour.title}</Text>
            <Text style={styles.tourSub}>
              {tour.location} · {tour.days || "3 ngày"} chuyến đi
            </Text>
            <Text style={styles.tourPrice}>
              {tour.price.toLocaleString("vi-VN")} VNĐ / người
            </Text>
            <Text>Số chỗ còn lại: {tour.remaining}</Text>
          </View>

          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={contact.fullName}
            onChangeText={(t) => setContact({ ...contact, fullName: t })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={contact.email}
            onChangeText={(t) => setContact({ ...contact, email: t })}
          />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={contact.phone}
            onChangeText={(t) => setContact({ ...contact, phone: t })}
          />

          <View style={styles.guestsHeader}>
            <Text style={styles.sectionTitle}>Khách tham gia</Text>
            <View style={styles.guestButtons}>
              <TouchableOpacity onPress={removeGuest} style={styles.guestBtn}>
                <Ionicons
                  name="remove-circle-outline"
                  size={28}
                  color="#4C67ED"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={addGuest} style={styles.guestBtn}>
                <Ionicons name="add-circle-outline" size={28} color="#4C67ED" />
              </TouchableOpacity>
            </View>
          </View>

          {guests.map((g, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={styles.guestLabel}>Người đi {i + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={g.name}
                onChangeText={(t) => {
                  const arr = [...guests];
                  arr[i].name = t;
                  setGuests(arr);
                }}
              />
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => showPicker(i)}
              >
                <Text style={{ color: g.birth ? "#000" : "#999" }}>
                  {g.birth ? g.birth.toLocaleDateString() : "Chọn ngày sinh"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {showDatePicker.visible && (
            <DateTimePicker
              value={guests[showDatePicker.index].birth || new Date()}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Tiếp theo</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  tourSub: { color: "#777", marginTop: 4 },
  tourPrice: { marginTop: 8, color: "#4C67ED", fontWeight: "700" },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    marginBottom: 10,
  },
  guestsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guestButtons: { flexDirection: "row" },
  guestBtn: { marginLeft: 10 },
  guestLabel: { color: "#555", marginBottom: 4 },
  nextButton: {
    backgroundColor: "#4C67ED",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  nextText: { color: "#fff", fontWeight: "600" },
});
