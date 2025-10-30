import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      Alert.alert("Logout failed", error.message);
    }
  };

  const avatarInitial =
    user?.displayName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.profileCard}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{avatarInitial}</Text>
          </View>
        )}

        <Text style={styles.name}>{user?.displayName ?? "No name"}</Text>
        <Text style={styles.email}>{user?.email ?? "No email"}</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#003580",
    marginBottom: 20,
  },
  profileCard: {
    width: "90%",
    alignItems: "center",
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#f7f7f7",
    marginBottom: 30,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 36,
    color: "#555",
    fontWeight: "700",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    color: "gray",
    marginTop: 4,
  },
  logoutButton: {
    width: "90%",
    backgroundColor: "red",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "700",
  },
});
