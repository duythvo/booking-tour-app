import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function TourCard({ tour }) {
  const navigation = useNavigation();
  return (
    <View
      style={styles.card}
    >
      {/* Nếu có nhiều ảnh → Carousel */}
      {tour.images && tour.images.length > 0 ? (
        <FlatList
          data={tour.images}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.carouselImage}
              resizeMode="cover"
              onError={(e) =>
                console.log("❌ Image error:", e.nativeEvent.error)
              }
            />
          )}
        />
      ) : tour.image_url ? (
        <Image
          source={{ uri: tour.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text>No image</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => navigation.navigate("TourDetail", { tour })} style={styles.info}>
        <View style={styles.rowBetween}>
          <Text style={styles.category}>
            {tour.category || "Outdoor Adventures"}
          </Text>
          <Ionicons name="heart-outline" size={20} color="#FF5A5F" />
        </View>

        <Text style={styles.title}>{tour.title || "Untitled Tour"}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {tour.description}
        </Text>

        <View style={styles.rowBetween}>
          <Text style={styles.price}>
            From ${tour.price ? tour.price : "N/A"} per person
          </Text>
          <Text style={styles.rating}>⭐ {tour.rating || 4.5}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
  },
  carouselImage: {
    width: width - 40, // 👈 ảnh full chiều ngang màn hình trừ padding
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: 200,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  info: { padding: 15 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: { color: "#4C67ED", fontWeight: "600", fontSize: 13 },
  title: { fontSize: 16, fontWeight: "700", color: "#222", marginVertical: 6 },
  desc: { fontSize: 14, color: "#555", marginBottom: 10 },
  price: { color: "#4C67ED", fontWeight: "600" },
  rating: { color: "#555", fontWeight: "500" },
});
