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
      Alert.alert(
        "No Lists",
        "You don't have any saved lists. Create one?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Create", onPress: () => setModalVisible(true) },
        ]
      );
    } else {
      setModalVisible(true);
    }
  };

  const handleAddToList = async (listId) => {
    await dispatch(addTourToList({ listId, tour }));
    setModalVisible(false);
    Alert.alert("Saved!", `Added to "${lists.find(l => l.id === listId)?.name}"`);
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim()) {
      Alert.alert("Error", "Please enter a list name.");
      return;
    }
    const action = await dispatch(createNewList(newListName.trim()));
    if (action.payload) {
      await handleAddToList(action.payload.id);
    }
    setNewListName("");
  };

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
            <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
          )}
        />
      ) : tour.image_url ? (
        <Image source={{ uri: tour.image_url }} style={styles.image} resizeMode="cover" />
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
          <Text style={styles.category}>{tour.category || "Adventure"}</Text>
          <TouchableOpacity onPress={openSaveModal}>
            <Ionicons name="heart-outline" size={24} color="#FF5A5F" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{tour.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{tour.description}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.price}>From ${tour.price}/person</Text>
          <Text style={styles.rating}>Rating {tour.rating || 4.5}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save to List</Text>

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
                placeholder="New list name..."
                value={newListName}
                onChangeText={setNewListName}
                style={styles.input}
              />
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateAndAdd}>
                <Text style={styles.createBtnText}>Create & Add</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
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
  carouselImage: { width: width - 40, height: 200, borderRadius: 10, marginRight: 10 },
  image: { width: "100%", height: 200 },
  imagePlaceholder: { width: "100%", height: 180, justifyContent: "center", alignItems: "center", backgroundColor: "#eee" },
  info: { padding: 15 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  category: { color: "#4C67ED", fontWeight: "600", fontSize: 13 },
  title: { fontSize: 16, fontWeight: "700", color: "#222", marginVertical: 6 },
  desc: { fontSize: 14, color: "#555", marginBottom: 10 },
  price: { color: "#4C67ED", fontWeight: "600" },
  rating: { color: "#555", fontWeight: "500" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 16, width: "85%", maxHeight: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15, textAlign: "center" },
  listItem: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  listItemText: { fontSize: 15 },
  createSection: { marginTop: 15 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 10 },
  createBtn: { backgroundColor: "#4C67ED", padding: 12, borderRadius: 8, alignItems: "center" },
  createBtnText: { color: "#fff", fontWeight: "600" },
  cancelBtn: { marginTop: 15, alignItems: "center" },
  cancelText: { color: "#666", fontWeight: "600" },
});