// screens/ProfileScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = getAuth();
  const user = auth.currentUser;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setProfile(docSnap.data());
      else
        setProfile({
          name: user.displayName || "Người dùng",
          email: user.email,
          phone: "",
          country: "Vietnam",
          gender: "Nam",
        });
    } catch (error) {
      console.log("Lỗi fetch profile:", error);
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      await fetchProfile();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchProfile);
    return unsubscribe;
  }, [navigation, fetchProfile]);

  useEffect(() => {
    if (route.params?.refresh) fetchProfile();
  }, [route.params?.refresh]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const menuItems = [
    { title: "Danh sách yêu thích", icon: "heart-outline", screen: "Saved" },
    { title: "Đặt chỗ của tôi", icon: "receipt-outline", screen: "MyBookings" },
    {
      title: "Thông tin ứng dụng",
      icon: "information-circle-outline",
      screen: "About",
    },
    { title: "Hỗ trợ", icon: "headset-outline", screen: "Contact" },
    { title: "Ngôn ngữ", icon: "globe-outline", screen: "Language" },
  ];

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003580" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.name}>{profile?.name || "Người dùng"}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <Text style={styles.phone}>
            {profile?.phone || "Chưa có số điện thoại"}
          </Text>
          <Text style={styles.location}>
            {profile?.country} ·{" "}
            {profile?.gender === "Male"
              ? "Nam"
              : profile?.gender === "Female"
              ? "Nữ"
              : "Khác"}
          </Text>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate("EditProfile", { user: profile })
            }
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity
          style={styles.logout}
          onPress={() => {
            auth.signOut();
            navigation.replace("Login");
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF5A5F" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  name: { fontSize: 22, fontWeight: "bold", color: "#fff", marginTop: 12 },
  email: { fontSize: 14, color: "#ddd", marginTop: 4 },
  phone: { fontSize: 13, color: "#ccc", marginTop: 4 },
  location: { fontSize: 13, color: "#ccc", marginTop: 6 },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#004a99",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    alignItems: "center",
  },
  editText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  menu: { marginTop: 24, paddingHorizontal: 16 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  menuText: { flex: 1, marginLeft: 16, fontSize: 16, color: "#222" },
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
  logoutText: { marginLeft: 10, color: "#FF5A5F", fontWeight: "600" },
});
