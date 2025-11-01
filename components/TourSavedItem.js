import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TourSavedItem({ tour, onView, onRemove }) {
  return (
    <TouchableOpacity
      style={styles.tourItem}
      onPress={() => onView(tour)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: tour.image_url || tour.images?.[0] }}
        style={styles.tourImage}
      />
      <View style={styles.tourInfo}>
        <View style={styles.tourHeader}>
          <Text style={styles.tourCategory}>{tour.category || "Tour"}</Text>
          {tour.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>
                {tour.rating} ({tour.reviews || 550})
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.tourTitle} numberOfLines={2}>
          {tour.title}
        </Text>
        <Text style={styles.tourPrice}>
          From <Text style={styles.priceAmount}>${tour.price}</Text> per person
        </Text>
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={(e) => {
          e.stopPropagation();
          onRemove(tour);
        }}
      >
        <Ionicons name="close-circle" size={24} color="#FF5A5F" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tourItem: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tourImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  tourInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  tourHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tourCategory: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  tourTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 4,
  },
  tourPrice: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
