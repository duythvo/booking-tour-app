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
import MapView, { Marker } from "react-native-maps";

const { width } = Dimensions.get("window");

export default function TourDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { tour } = route.params;

  const formattedRating = (tour.rating || 4.5).toFixed(1);

  const highlights = [
    "Hướng dẫn viên địa phương",
    "Bao gồm ăn uống và chỗ nghỉ",
    "Đưa đón miễn phí",
  ];

  const reviews = [
    { id: 1, name: "Nguyễn Văn A", rating: 5, comment: "Tour tuyệt vời!" },
    { id: 2, name: "Trần Thị B", rating: 4, comment: "Trải nghiệm rất tốt!" },
    { id: 3, name: "Lê Văn C", rating: 5, comment: "Rất hài lòng!" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hình cover */}
        <View style={styles.header}>
          {tour.images && tour.images.length > 0 ? (
            <Image source={{ uri: tour.images[0] }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>Không có hình ảnh</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Thông tin tour */}
        <View style={styles.content}>
          <Text style={styles.title}>{tour.title}</Text>

          <View style={styles.rowBetween}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location-outline" size={16} color="#777" />
              <Text style={styles.location}>{tour.destination}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{formattedRating} (230)</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Điểm nổi bật</Text>
          {highlights.map((item, index) => (
            <View style={styles.highlightItem} key={index}>
              <MaterialIcons name="check-circle" size={18} color="#4C67ED" />
              <Text style={styles.highlightText}>{item}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Mô tả tour</Text>
          <Text style={styles.description}>{tour.description}</Text>

          {/* Bản đồ */}
          {tour.locations && tour.locations.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Bản đồ</Text>
              <MapView
                style={{ width: "100%", height: 200, borderRadius: 12 }}
                initialRegion={{
                  latitude: tour.locations[0].latitude,
                  longitude: tour.locations[0].longitude,
                  latitudeDelta: 1.5,
                  longitudeDelta: 1.5,
                }}
              >
                {tour.locations.map((loc, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    }}
                    title={loc.title}
                  />
                ))}
              </MapView>
            </>
          )}

          <Text style={styles.sectionTitle}>Hình ảnh khác</Text>
          {tour.images && tour.images.length > 1 && (
            <FlatList
              data={tour.images.slice(1)}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.galleryImage} />
              )}
            />
          )}

          <Text style={styles.sectionTitle}>Đánh giá khách</Text>
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesome name="user-circle" size={28} color="#555" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.reviewerName}>{r.name}</Text>
                  <View style={{ flexDirection: "row" }}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Ionicons key={i} name="star" size={14} color="#FFD700" />
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

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Giá từ</Text>
          <Text style={styles.price}>{tour.price.toLocaleString()} VNĐ</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Bookings", { tour })}
          style={styles.bookButton}
        >
          <Text style={styles.bookText}>Đặt ngay</Text>
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
