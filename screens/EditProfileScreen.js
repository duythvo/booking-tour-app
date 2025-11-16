// screens/EditProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, storage } from "../firebase";
import {
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProfileScreen({ route }) {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const initialData = route.params?.user || {};

  const [name, setName] = useState(initialData.name || "");
  const [email, setEmail] = useState(initialData.email || user?.email || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [country, setCountry] = useState(initialData.country || "Vietnam");
  const [gender, setGender] = useState(initialData.gender || "Male");
  const [password, setPassword] = useState(""); // dùng để xác thực email
  const [avatar, setAvatar] = useState(initialData.avatar || user?.photoURL);

  // --- Yêu cầu quyền truy cập ảnh ---
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập bị từ chối", "Cần cấp quyền để chọn ảnh");
      }
    })();
  }, []);


  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) =>
    /^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ""));

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ (10-15 số)");
      return;
    }

    try {
      let avatarURL = avatar;

      // Upload ảnh lên Firebase Storage nếu người dùng chọn mới
      if (avatar && avatar !== initialData.avatar) {
        const response = await fetch(avatar);
        const blob = await response.blob();
        const storageRef = ref(storage, `avatars/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        avatarURL = await getDownloadURL(storageRef);
      }

      // Nếu email thay đổi
      if (email !== user.email) {
        if (!password) {
          Alert.alert(
            "Yêu cầu mật khẩu",
            "Nhập mật khẩu hiện tại để thay đổi email"
          );
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
      }

      const userDocRef = doc(db, "users", user.uid);
      const updateData = {
        name,
        email,
        phone,
        country,
        gender,
        avatar: avatarURL,
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, updateData, { merge: true });

      Alert.alert("Thành công", "Cập nhật thông tin thành công!", [
        {
          text: "OK",
          onPress: () => navigation.goBack({ refresh: true }),
        },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Name */}
        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập họ và tên"
        />

        {/* Email */}
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Nhập email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {email !== user?.email && (
          <>
            <Text style={styles.label}>Mật khẩu hiện tại *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu"
              secureTextEntry
            />
          </>
        )}

        {/* Phone */}
        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+84 123 456 789"
          keyboardType="phone-pad"
        />

        {/* Country */}
        <Text style={styles.label}>Quốc gia *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={country}
            onValueChange={(itemValue) => setCountry(itemValue)}
          >
            <Picker.Item label="Vietnam" value="Vietnam" />
            <Picker.Item label="United States" value="United States" />
            <Picker.Item label="United Kingdom" value="United Kingdom" />
            <Picker.Item label="Australia" value="Australia" />
            <Picker.Item label="Canada" value="Canada" />
            <Picker.Item label="Japan" value="Japan" />
            <Picker.Item label="South Korea" value="South Korea" />
            <Picker.Item label="Germany" value="Germany" />
            <Picker.Item label="France" value="France" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {/* Gender */}
        <Text style={styles.label}>Giới tính</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={gender} onValueChange={setGender}>
            <Picker.Item label="Nam" value="Male" />
            <Picker.Item label="Nữ" value="Female" />
            <Picker.Item label="Khác" value="Other" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  avatarWrapper: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  changeAvatarText: { color: "#003580", marginTop: 6, fontWeight: "500" },
});
