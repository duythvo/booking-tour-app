import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addTourToList, createNewList } from "../store/savedSlice";

const { width } = Dimensions.get("window");

export default function TourCard({ tour }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { lists = [] } = useSelector((state) => state.saved || { lists: [] });

  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState("");

  const openSaveModal = () => {
    if (lists.length === 0) {
      Alert.alert("Chưa có danh sách", "Bạn muốn tạo danh sách mới?", [
        { text: "Hủy", style: "cancel" },
        { text: "Tạo", onPress: () => setModalVisible(true) },
      ]);
    } else {
      setModalVisible(true);
    }
  };

  const handleAddToList = async (listId) => {
    try {
      const result = await dispatch(addTourToList({ listId, tour })).unwrap();

      setModalVisible(false);

      const listName = lists.find((l) => l.id === listId)?.name;
      Alert.alert(
        "✅ Đã lưu!",
        `Đã thêm "${tour.title}" vào "${listName}"`,
        [{ text: "OK" }]
      );
    } catch (error) {
      setModalVisible(false);

      if (error === "Tour already exists in this list") {
        Alert.alert(
          "⚠️ Tour đã có trong danh sách",
          `"${tour.title}" đã được lưu trong danh sách này rồi!`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Lỗi", error);
      }
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên danh sách.");
      return;
    }

    try {
      const action = await dispatch(createNewList(newListName.trim()));
      if (action.payload) {
        await handleAddToList(action.payload.id);
      }
      setNewListName("");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo danh sách mới");
    }
  };

  const formattedRating = (tour.rating || 4.5).toFixed(1);
  const formattedPrice = tour.price || 0;

  return (
    <View style={styles.card}>
      {/* HÌNH ẢNH */}
      {tour.images && tour.images.length > 0 ? (
        <FlatList
          data={tour.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.carouselImage}
              resizeMode="cover"
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

      <TouchableOpacity
        onPress={() => navigation.navigate("TourDetail", { tour })}
        style={styles.info}
      >
        <View style={styles.rowBetween}>
          <Text style={styles.category}>
            {tour.category || "Tour liên tỉnh"}
          </Text>
          <TouchableOpacity onPress={openSaveModal}>
            <Ionicons name="heart-outline" size={24} color="#FF5A5F" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{tour.title}</Text>

        <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
          {tour.description || "No description available"}
        </Text>

        <View style={styles.rowBetween}>
          <Text style={styles.price}>Từ {formattedPrice} VNĐ/người</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{formattedRating}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* MODAL LƯU TOUR */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lưu vào danh sách</Text>

            {lists.map((list) => (
              <TouchableOpacity
                key={list.id}
                style={styles.listItem}
                onPress={() => handleAddToList(list.id)}
              >
                <Text style={styles.listItemText}>
                  {list.name} ({list.tours.length})
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.createSection}>
              <TextInput
                placeholder="Tên danh sách mới..."
                value={newListName}
                onChangeText={setNewListName}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.createBtn}
                onPress={handleCreateAndAdd}
              >
                <Text style={styles.createBtnText}>Tạo & Thêm</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginHorizontal: 15,
  },
  carouselImage: {
    width: width - 40,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  image: { width: "100%", height: 200 },
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
  rating: { color: "#555", fontWeight: "500", marginLeft: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  listItem: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  listItemText: { fontSize: 15 },
  createSection: { marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  createBtn: {
    backgroundColor: "#4C67ED",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createBtnText: { color: "#fff", fontWeight: "600" },
  cancelBtn: { marginTop: 15, alignItems: "center" },
  cancelText: { color: "#666", fontWeight: "600" },
});