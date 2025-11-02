// screens/ContactScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ContactScreen() {
  const navigation = useNavigation();

  const contacts = [
    {
      icon: "mail-outline",
      title: "Email Us",
      value: "support@tourbooking.com",
      action: () => Linking.openURL("mailto:support@tourbooking.com"),
    },
    {
      icon: "call-outline",
      title: "Call Us",
      value: "+84 123 456 789",
      action: () => Linking.openURL("tel:+84123456789"),
    },
    {
      icon: "chatbubble-outline",
      title: "Live Chat",
      value: "Available 24/7",
      action: () => Alert.alert("Live Chat", "Chat feature coming soon!"),
    },
    {
      icon: "location-outline",
      title: "Visit Us",
      value: "123 Travel Street, Hanoi, Vietnam",
      action: () => Linking.openURL("https://maps.google.com/?q=123+Travel+Street+Hanoi"),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Contact Support</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.welcome}>
          We’re here to help! Reach out anytime.
        </Text>

        {contacts.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.contactCard}
            onPress={item.action}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={24} color="#003580" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{item.title}</Text>
              <Text style={styles.contactValue}>{item.value}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}

        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        <TouchableOpacity
          style={styles.faqItem}
          onPress={() => Alert.alert("FAQ", "1. How to book?\n2. Cancellation policy?\n3. Payment methods?")}
        >
          <Text style={styles.faqQuestion}>How do I cancel a booking?</Text>
          <Ionicons name="chevron-down" size={20} color="#777" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#003580",
    padding: 16,
    paddingTop: 50,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  content: { padding: 20 },
  welcome: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e6f0ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 14, color: "#777" },
  contactValue: { fontSize: 16, fontWeight: "600", color: "#222", marginTop: 2 },
  faqTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginTop: 30,
    marginBottom: 12,
  },
  faqItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  faqQuestion: { fontSize: 15, color: "#444" },
});