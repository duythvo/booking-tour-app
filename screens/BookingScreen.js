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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingScreen({ navigation, route }) {
  const { tour } = route.params;
  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [guests, setGuests] = useState([{ name: "", birth: "" }]);

  const handleNext = () => {
    navigation.navigate("PaymentOption", { tour, contact, guests });
  };

  const addGuest = () => setGuests([...guests, { name: "", birth: "" }]);
  const removeGuest = () => {
    if (guests.length > 1) setGuests(guests.slice(0, -1));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Thông tin tour */}
          <View style={styles.tourCard}>
            <Text style={styles.tourTitle}>{tour.title}</Text>
            <Text style={styles.tourSub}>
              {tour.location} · {tour.days || "3 ngày"} chuyến đi
            </Text>
            <Text style={styles.tourPrice}>
              ${tour.price || 299}
            </Text>
          </View>

          {/* Thông tin liên hệ */}
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

          {/* Khách */}
          <View style={styles.guestsHeader}>
            <Text style={styles.sectionTitle}>Khách tham gia</Text>
            <View style={styles.guestButtons}>
              <TouchableOpacity onPress={removeGuest} style={styles.guestBtn}>
                <Ionicons name="remove-circle-outline" size={28} color="#4C67ED" />
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
              <TextInput
                style={styles.input}
                placeholder="Ngày sinh (MM/DD/YYYY)"
                value={g.birth}
                onChangeText={(t) => {
                  const arr = [...guests];
                  arr[i].birth = t;
                  setGuests(arr);
                }}
              />
            </View>
          ))}

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
