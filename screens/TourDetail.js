import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function TourDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { tour } = route.params;

  const highlights = [
    "Guided city tour with local expert",
    "Includes meals and accommodation",
    "Free pickup and drop-off",
  ];

  const reviews = [
    { id: 1, name: "John Doe", rating: 5, comment: "Amazing trip!" },
    { id: 2, name: "Sarah Lee", rating: 4, comment: "Great experience overall!" },
    { id: 3, name: "Tom Nguyen", rating: 5, comment: "Loved every moment!" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.header}>
          {tour.images && tour.images.length > 0 ? (
            <Image source={{ uri: tour.images[0] }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>No Image</Text>
            </View>
          )}
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          {/* Favorite */}
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tour Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{tour.title || "Untitled Tour"}</Text>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location-outline" size={16} color="#777" />
              <Text style={styles.location}>{tour.location || "Unknown"}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>4.8 (230)</Text>
            </View>
          </View>

          {/* Highlights */}
          <Text style={styles.sectionTitle}>Trip Highlights</Text>
          {highlights.map((item, index) => (
            <View style={styles.highlightItem} key={index}>
              <MaterialIcons name="check-circle" size={18} color="#4C67ED" />
              <Text style={styles.highlightText}>{item}</Text>
            </View>
          ))}

          {/* Description */}
          <Text style={styles.sectionTitle}>About this tour</Text>
          <Text style={styles.description}>
            {tour.description ||
              "Experience the best of this destination with our expertly crafted itinerary, designed to offer culture, adventure, and relaxation."}
          </Text>

          {/* Gallery */}
          {tour.images && tour.images.length > 1 && (
            <>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <FlatList
                data={tour.images.slice(1)}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.galleryImage} />
                )}
              />
            </>
          )}

          {/* Reviews */}
          <Text style={styles.sectionTitle}>Traveler Reviews</Text>
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesome name="user-circle" size={28} color="#555" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.reviewerName}>{r.name}</Text>
                  <View style={{ flexDirection: "row" }}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={14}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.price}>${tour.price || 299}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Bookings", { tour })} style={styles.bookButton}>
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { position: "relative" },
  coverImage: { width: width, height: 260 },
  imagePlaceholder: {
    width: "100%",
    height: 260,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 30,
  },
  heartButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 30,
  },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#222" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  location: { marginLeft: 5, color: "#777", fontSize: 14 },
  rating: { marginLeft: 5, color: "#333", fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#222",
  },
  highlightItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  highlightText: { marginLeft: 8, color: "#555", fontSize: 15 },
  description: { color: "#555", fontSize: 15, lineHeight: 22 },
  galleryImage: {
    width: 160,
    height: 110,
    borderRadius: 12,
    marginRight: 12,
  },
  reviewCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewerName: { fontWeight: "600", color: "#222" },
  reviewComment: { color: "#555", marginTop: 5, lineHeight: 20 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
    elevation: 10,
  },
  priceLabel: { color: "#777", fontSize: 13 },
  price: { color: "#222", fontSize: 20, fontWeight: "700" },
  bookButton: {
    backgroundColor: "#4C67ED",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
