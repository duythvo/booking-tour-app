import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSavedLists,
  createNewList,
  removeTourFromList,
  deleteList,
} from "../store/savedSlice";
import { auth } from "../firebase";

export default function SavedScreen({ navigation }) {
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.saved || { lists: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState("");

  useEffect(() => {
    if (auth.currentUser) {
      dispatch(fetchSavedLists());
    }
  }, [dispatch]);

  const handleCreateList = async () => {
    if (!listName.trim()) {
      Alert.alert("Oops", "Please enter a list name!");
      return;
    }
    await dispatch(createNewList(listName.trim()));
    setListName("");
    setModalVisible(false);
  };

  const handleDeleteList = (listId, listName) => {
    Alert.alert(
      "Delete List",
      `Delete "${listName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteList(listId)).unwrap();
              Alert.alert("Deleted!", `"${listName}" has been removed.`);
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete list.");
            }
          },
        },
      ]
    );
  };

  const handleRemoveTour = (listId, tourId, tourTitle) => {
    Alert.alert("Remove Tour", `Remove "${tourTitle}" from list?`, [
      { text: "Cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          dispatch(removeTourFromList({ listId, tourId }));
        },
      },
    ]);
  };

  // XEM CHI TIẾT TOUR
  const handleViewTour = (tour) => {
    navigation.navigate("TourDetail", { tour });
  };

  if (lists.length === 0 && !loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={80} color="#4C67ED" />
            </View>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyDesc}>
              Save your favorite tours to compare and book later.
            </Text>
            <TouchableOpacity
              style={styles.createFirstBtn}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.createFirstText}>Create Your First List</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>New List</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Barcelona 2025"
                  value={listName}
                  onChangeText={setListName}
                  autoFocus
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item: list }) => (
              <View style={styles.listCard}>
                <View style={styles.listHeader}>
                  <Text style={styles.listName}>{list.name}</Text>
                  <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                    <Text style={styles.tourCount}>{list.tours.length} saved</Text>
                    <TouchableOpacity onPress={() => handleDeleteList(list.id, list.name)}>
                      <Ionicons name="trash-outline" size={20} color="#FF5A5F" />
                    </TouchableOpacity>
                  </View>
                </View>

  
                <FlatList
                  data={list.tours}
                  keyExtractor={(t) => t.id}
                  renderItem={({ item: tour }) => (
                    <TouchableOpacity
                      style={styles.tourItem}
                      onPress={() => handleViewTour(tour)} // XEM CHI TIẾT
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: tour.image_url || tour.images?.[0] }}
                        style={styles.tourImage}
                      />
                      <View style={styles.tourInfo}>
                        <View style={styles.tourHeader}>
                          <Text style={styles.tourCategory}>
                            {tour.category || "Activity"}
                          </Text>
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
                          e.stopPropagation(); // NGĂN XEM CHI TIẾT KHI XÓA
                          handleRemoveTour(list.id, tour.id, tour.title);
                        }}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF5A5F" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>Create New List</Text>
                <TextInput
                  style={styles.input}
                  placeholder="List name..."
                  value={listName}
                  onChangeText={setListName}
                  autoFocus
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f8f9fa",
  },
  emptyIcon: {
    backgroundColor: "#e3eaff",
    padding: 30,
    borderRadius: 50,
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 26, fontWeight: "800", color: "#1a1a1a", marginBottom: 10 },
  emptyDesc: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 24 },
  createFirstBtn: {
    flexDirection: "row",
    backgroundColor: "#4C67ED",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
    gap: 10,
    shadowColor: "#4C67ED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createFirstText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listName: { fontSize: 19, fontWeight: "700", color: "#1a1a1a" },
  tourCount: { fontSize: 14, color: "#888" },

  // TOUR ITEM
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

  // FAB
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#4C67ED",
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4C67ED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    width: "88%",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancel: { fontSize: 17, color: "#666", fontWeight: "600" },
  create: {
    backgroundColor: "#4C67ED",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});