// screens/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          // Tạo profile mặc định nếu chưa có
          setProfile({
            name: user.displayName || "User",
            email: user.email,
            phone: "",
            country: "Vietnam",
            gender: "Male",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // SỬA: Dẫn đến trang About & Contact
  const menuItems = [
    { title: "Save List", icon: "heart-outline", screen: "Saved" },
    { title: "My Bookings", icon: "receipt-outline", screen: "MyBookings" },
    { title: "About App", icon: "information-circle-outline", screen: "About" },
    { title: "Contact Support", icon: "headset-outline", screen: "Contact" },
    { title: "Language", icon: "globe-outline", screen: "Language" }, // Nếu có
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003580" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: user?.photoURL || "https://via.placeholder.com/100" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.name || "User"}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          {/* THÊM: Hiển thị số điện thoại */}
          <Text style={styles.phone}>
            {profile?.phone ? profile.phone : "No phone number"}
          </Text>
          <Text style={styles.location}>
            {profile?.country} · {profile?.gender}
          </Text>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile", { user: profile })}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={24} color="#003580" />
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logout}
          onPress={() => {
            auth.signOut();
            navigation.replace("Login");
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF5A5F" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#003580",
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 4,
  },
  // THÊM: Style cho phone
  phone: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 4,
  },
  location: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 6,
  },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#004a99",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  menu: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#222",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF5A5F",
  },
  logoutText: {
    marginLeft: 10,
    color: "#FF5A5F",
    fontWeight: "600",
  },
});