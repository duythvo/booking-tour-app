import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TourCard from "../components/TourCard";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const navigation = useNavigation();
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    const fetchToursWithImages = async () => {
      try {
        const toursSnap = await getDocs(collection(db, "tours"));
        const tourList = toursSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const imagesSnap = await getDocs(collection(db, "images"));
        const imageList = imagesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const toursWithImages = tourList.map((tour) => {
          const relatedImages = imageList
            .filter((img) => img.tour_id?.id === tour.id)
            .map((img) => img.image_url);
          return { ...tour, images: relatedImages };
        });

        setTours(toursWithImages);
        setFilteredTours(toursWithImages);
      } catch (error) {
        console.error("Error loading tours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToursWithImages();
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredTours(tours);
      return;
    }

    const lower = searchText.toLowerCase();
    const filtered = tours.filter(
      (t) =>
        t.title?.toLowerCase().includes(lower) ||
        t.description?.toLowerCase().includes(lower) ||
        t.category?.toLowerCase().includes(lower)
    );
    setFilteredTours(filtered);
  }, [searchText, tours]);

  // --- Gửi audio sang Flask ---
  const sendAudioToBackend = async (uri) => {
    try {
      if (!uri) {
        alert("File audio không tồn tại");
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "voice.m4a",
        type: "audio/m4a",
      });

      const res = await fetch("https://airily-inconvincible-amelie.ngrok-free.dev/voice_search", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.json();

      if (data.tour) {
        navigation.navigate("TourDetail", { tour: data.tour });
      } else {
        alert(data.message || "Không tìm thấy tour phù hợp");
      }
    } catch (err) {
      console.error("Lỗi gửi audio:", err);
      alert("Lỗi gửi giọng nói");
    }
  };

  // --- Bắt đầu / dừng ghi âm ---
  const toggleRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Bạn cần cấp quyền micro để sử dụng trợ lý ảo");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      if (!isRecording) {
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
        setIsRecording(true);
      } else {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setIsRecording(false);
        setRecording(null);

        if (uri) {
          sendAudioToBackend(uri);
        }
      }
    } catch (err) {
      console.error("Lỗi ghi âm:", err);
      Alert.alert("Lỗi ghi âm");
      setIsRecording(false);
      setRecording(null);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
          }}
          style={styles.headerImage}
        />
        <View style={styles.overlay}>
          <View style={styles.headerTop}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/5556/5556499.png",
              }}
              style={styles.logo}
            />
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=3" }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              placeholder="Search tour, destination..."
              placeholderTextColor="#aaa"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tabActive}>
          <Ionicons name="heart-outline" size={16} color="#4C67ED" />
          <Text style={styles.tabActiveText}>Your Interested</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <MaterialIcons name="local-offer" size={16} color="#555" />
          <Text style={styles.tabText}>Special deals</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nature Escapes</Text>
          <TouchableOpacity>
            <Text style={styles.seeMore}>See More</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>Loading tours...</Text>
        ) : filteredTours.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            No tours found.
          </Text>
        ) : (
          <FlatList
            data={filteredTours}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TourCard tour={item} />}
            scrollEnabled={false}
          />
        )}
      </View>

      <TouchableOpacity style={styles.assistantButton} onPress={toggleRecording}>
        <Ionicons
          name={isRecording ? "mic" : "mic-outline"}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1 },
  header: { position: "relative" },
  headerImage: { width: "100%", height: 220 },
  overlay: { position: "absolute", top: 40, left: 20, right: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 40, height: 40 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  searchBar: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  tabs: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  tabActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9EEFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  tabActiveText: { color: "#4C67ED", marginLeft: 5, fontWeight: "500" },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
  },
  tabText: { marginLeft: 5, color: "#555" },
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#222" },
  seeMore: { color: "#4C67ED", fontWeight: "500" },
  assistantButton: {
    position: "absolute",
    bottom: 40,
    right: 25,
    backgroundColor: "#4C67ED",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
