import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchSavedLists, createNewList, removeTourFromList } from "../store/savedSlice";
import { auth } from "../firebase";

export default function SavedScreen({ navigation }) {
  const dispatch = useDispatch();
  const { lists, loading } = useSelector(state => state.saved);
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState("");

  useEffect(() => {
    if (auth.currentUser) {
      dispatch(fetchSavedLists());
    }
  }, [dispatch]);

  const handleCreateList = async () => {
    if (!listName.trim()) return;
    await dispatch(createNewList(listName));
    setListName("");
    setModalVisible(false);
  };

  const handleRemoveTour = (listId, tourId) => {
    Alert.alert("Remove", "Remove this tour from list?", [
      { text: "Cancel" },
      { text: "Remove", style: "destructive", onPress: () => dispatch(removeTourFromList({ listId, tourId })) }
    ]);
  };

  if (lists.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color="#4C67ED" />
        <Text style={styles.emptyTitle}>Empty</Text>
        <Text style={styles.emptyDesc}>
          Create lists of your favorite properties to help you share, compare, and book.
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.ctaText}>Create Lists</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={item => item.id}
        renderItem={({ item: list }) => (
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text style={styles.tourCount}>{list.tours.length} tours</Text>
            </View>
            <FlatList
              data={list.tours}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={t => t.id}
              renderItem={({ item: tour }) => (
                <TouchableOpacity
                  style={styles.tourItem}
                  onPress={() => navigation.navigate("TourDetail", { tour })}
                >
                  <Image source={{ uri: tour.image_url || tour.images?.[0] }} style={styles.tourImage} />
                  <TouchableOpacity
                    style={styles.removeHeart}
                    onPress={() => handleRemoveTour(list.id, tour.id)}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF5A5F" />
                  </TouchableOpacity>
                  <Text style={styles.tourTitle} numberOfLines={1}>{tour.title}</Text>
                  <Text style={styles.tourPrice}>${tour.price}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.input}
              placeholder="List name"
              value={listName}
              onChangeText={setListName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.create} onPress={handleCreateList}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  emptyTitle: { fontSize: 24, fontWeight: "700", marginTop: 20 },
  emptyDesc: { textAlign: "center", color: "#666", marginVertical: 15, lineHeight: 22 },
  ctaButton: { backgroundColor: "#4C67ED", paddingHorizontal: 30, paddingVertical: 14, borderRadius: 30, marginTop: 20 },
  ctaText: { color: "#fff", fontWeight: "600" },
  listCard: { backgroundColor: "#fff", margin: 15, borderRadius: 16, padding: 15, elevation: 2 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  listName: { fontSize: 18, fontWeight: "700" },
  tourCount: { color: "#666" },
  tourItem: { marginRight: 12, width岗位: 140 },
  tourImage: { width: 140, height: 100, borderRadius: 12 },
  removeHeart: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 15, padding: 2 },
  tourTitle: { fontWeight: "600", marginTop: 6, fontSize: 13 },
  tourPrice: { color: "#4C67ED", fontWeight: "600", fontSize: 12 },
  fab: { position: "absolute", bottom: 30, right: 20, backgroundColor: "#4C67ED", width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", padding: 20, borderRadius: 16, width: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 15 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  cancel: { color: "#666", fontWeight: "600" },
  create: { backgroundColor: "#4C67ED", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  createText: { color: "#fff", fontWeight: "600" },
});