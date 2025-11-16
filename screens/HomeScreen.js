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
  Animated,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import TourCard from "../components/TourCard";
import SyncIndicator from "../components/SyncIndicator";
import { useNavigation } from "@react-navigation/native";

const ITEMS_PER_PAGE = 2;

export default function HomeScreen() {
  const [tours, setTours] = useState([]);
  const [displayedTours, setDisplayedTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const fetchAllTours = async () => {
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
        const imgs = imageList
          .filter((img) => img.tour_id?.id === tour.id)
          .map((img) => img.image_url);
        return { ...tour, images: imgs };
      });

      setTours(toursWithImages);

      const initial = toursWithImages.slice(0, ITEMS_PER_PAGE);
      setDisplayedTours(initial);
      setFilteredTours(initial);
      setHasMore(toursWithImages.length > ITEMS_PER_PAGE);

    } catch (err) {
      console.error("Error loading tours:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTours();
  }, []);

  const loadMoreTours = () => {
    if (loadingMore || !hasMore || searchText.trim()) return;

    setLoadingMore(true);

    setTimeout(() => {
      const nextPage = page + 1;
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const moreTours = tours.slice(start, end);

      if (moreTours.length > 0) {
        setDisplayedTours(prev => [...prev, ...moreTours]);
        setFilteredTours(prev => [...prev, ...moreTours]);
        setPage(nextPage);
        setHasMore(end < tours.length);
      } else {
        setHasMore(false);
      }

      setLoadingMore(false);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchAllTours();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredTours(displayedTours);
    } else {
      const lower = searchText.toLowerCase();
      const filtered = tours.filter(
        (t) =>
          t.title?.toLowerCase().includes(lower) ||
          t.description?.toLowerCase().includes(lower) ||
          t.category?.toLowerCase().includes(lower)
      );
      setFilteredTours(filtered);
    }
  }, [searchText, displayedTours, tours]);

  const sendAudioToBackend = async (uri) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "voice.m4a",
        type: "audio/m4a",
      });

      const res = await fetch(
        "https://airily-inconvincible-amelie.ngrok-free.dev/voice_search",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await res.json();

      if (data.tours && data.tours.length > 0) {
        setFilteredTours(data.tours);
        Alert.alert("✅ Đã tìm thấy " + data.tours.length + " tour phù hợp");
      } else {
        Alert.alert("❌ Không tìm thấy tour phù hợp");
      }
    } catch (err) {
      console.error("Lỗi gửi audio:", err);
      Alert.alert("Lỗi gửi giọng nói");
    } finally {
      setIsProcessing(false);
      hideChat();
    }
  };

  const showChat = () => {
    setChatVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideChat = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setChatVisible(false));
  };

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
      });

      if (!isRecording) {
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await rec.startAsync();
        setRecording(rec);
        setIsRecording(true);
        setIsProcessing(false);
        showChat();
      } else {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setIsRecording(false);
        setRecording(null);
        setIsProcessing(true);
        if (uri) sendAudioToBackend(uri);
      }
    } catch (err) {
      console.error("Lỗi ghi âm:", err);
      Alert.alert("Không thể ghi âm");
      setIsRecording(false);
      setRecording(null);
      hideChat();
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4C67ED" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ✅ SYNC INDICATOR */}
      <SyncIndicator />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        stickyHeaderIndices={[0]}
      >
        {/* HEADER */}
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
                  uri: "https://cdn-icons-png.flaticon.com/512/4712/4712100.png",
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
                placeholder="Tìm kiếm tour, điểm đến..."
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

        {/* TOUR LIST */}
        <View style={styles.section}>
          {loading ? (
            <View style={styles.centerLoader}>
              <ActivityIndicator size="large" color="#4C67ED" />
              <Text style={styles.loadingText}>Đang tải tour...</Text>
            </View>
          ) : filteredTours.length === 0 ? (
            <Text style={styles.emptyText}>
              Không có tour phù hợp.
            </Text>
          ) : (
            <FlatList
              data={filteredTours}
              keyExtractor={(item, index) =>
                item.id?.toString() || index.toString()
              }
              renderItem={({ item }) => <TourCard tour={item} />}
              scrollEnabled={false}
              onEndReached={loadMoreTours}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )}
        </View>
      </ScrollView>

      {/* Chat Bubble */}
      {chatVisible && (
        <Animated.View style={[styles.chatBubble, { opacity: fadeAnim }]}>
          <Text style={styles.chatText}>
            {isRecording
              ? "🎤 Mời bạn nói..."
              : isProcessing
                ? "🤖 Đang xử lý..."
                : ""}
          </Text>
        </Animated.View>
      )}

      {/* Assistant Button */}
      <TouchableOpacity
        style={styles.assistantButton}
        onPress={toggleRecording}
      >
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/4712/4712100.png",
          }}
          style={styles.botIcon}
        />
        <Ionicons
          name={isRecording ? "mic" : "mic-outline"}
          size={28}
          color="#fff"
          style={{ position: "absolute", bottom: 8 }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  header: { position: "relative" },
  headerImage: { width: "100%", height: 220 },
  overlay: { position: "absolute", top: 40, left: 20, right: 20 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  section: { marginTop: 25, paddingHorizontal: 20 },
  centerLoader: {
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 15,
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
  assistantButton: {
    position: "absolute",
    bottom: 40,
    right: 25,
    backgroundColor: "#4C67ED",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  botIcon: { width: 70, height: 70, borderRadius: 35, opacity: 0.9 },
  chatBubble: {
    position: "absolute",
    bottom: 130,
    right: 35,
    backgroundColor: "#4C67ED",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: 220,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  chatText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});