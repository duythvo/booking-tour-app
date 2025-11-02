// screens/EditProfileScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export default function EditProfileScreen({ route }) {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const initialData = route.params?.user || {};

  const [name, setName] = useState(initialData.name || "");
  const [email, setEmail] = useState(initialData.email || user?.email || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [country, setCountry] = useState(initialData.country || "");
  const [gender, setGender] = useState(initialData.gender || "Male");

  const [password, setPassword] = useState(""); // Để xác thực lại khi đổi email

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ""));

  const handleSave = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !phone.trim() || !country.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert("Error", "Please enter a valid phone number (10-15 digits)");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const updateData = {
        name,
        email,
        phone,
        country,
        gender,
        updatedAt: serverTimestamp(),
      };

      // Nếu email thay đổi → cần xác thực lại + cập nhật Auth
      if (email !== user.email) {
        if (!password) {
          Alert.alert("Password Required", "Enter your current password to change email");
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
      }

      // Lưu vào Firestore
      await setDoc(userDocRef, updateData, { merge: true });

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        Alert.alert("Wrong Password", "The password you entered is incorrect");
      } else if (error.code === "auth/email-already-in-use") {
        Alert.alert("Email in Use", "This email is already registered");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Name */}
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        {/* Email */}
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password (chỉ hiện khi đổi email) */}
        {email !== user?.email && (
          <>
            <Text style={styles.label}>Current Password *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Required to change email"
              secureTextEntry
            />
          </>
        )}

        {/* Phone */}
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+84 123 456 789"
          keyboardType="phone-pad"
        />

        {/* Country */}
        <Text style={styles.label}>Country *</Text>
        <TextInput
          style={styles.input}
          value={country}
          onChangeText={setCountry}
          placeholder="Enter your country"
        />

        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={gender} onValueChange={setGender}>
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 , backgroundColor: "#f9f9f9" },
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#fff",
  },
  saveBtn: {
    backgroundColor: "#003580",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});