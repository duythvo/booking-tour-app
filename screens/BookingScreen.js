import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BookingScreen({ navigation, route }) {
  const { tour } = route.params;
  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [guests, setGuests] = useState([
    { name: "", birth: "" },
    { name: "", birth: "" },
  ]);

  const handleNext = () => {
    navigation.navigate("PaymentOption", { tour, contact, guests });
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
        <Text style={styles.headerTitle}>Contact Info</Text>
      </View>

      <View style={styles.tourCard}>
        <Text style={styles.tourTitle}>{tour.title}</Text>
        <Text style={styles.tourSub}>
          {tour.location} · {tour.days || "3 days"} trip
        </Text>
        <Text style={styles.tourPrice}>${tour.price || 299}</Text>
      </View>

      <Text style={styles.sectionTitle}>Contact Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
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
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={contact.phone}
        onChangeText={(t) => setContact({ ...contact, phone: t })}
      />

      <Text style={styles.sectionTitle}>Guests</Text>
      {guests.map((g, i) => (
        <View key={i} style={{ marginBottom: 10 }}>
          <Text style={styles.guestLabel}>Traveler {i + 1}</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={g.name}
            onChangeText={(t) => {
              const arr = [...guests];
              arr[i].name = t;
              setGuests(arr);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Birth Date (MM/DD/YYYY)"
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
        <Text style={styles.nextText}>Next</Text>
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
