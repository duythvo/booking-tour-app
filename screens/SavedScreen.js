import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
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
import TourSavedItem from "../components/TourSavedItem";

export default function SavedScreen({ navigation }) {
  const dispatch = useDispatch();
  const { lists = [], loading } = useSelector((state) => state.saved || {});
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (auth.currentUser) {
      dispatch(fetchSavedLists());
    }
  }, [dispatch]);

  const filteredLists = lists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    Alert.alert("Delete List", `Delete "${listName}"? This cannot be undone.`, [
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
    ]);
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

  const handleViewTour = (tour) => {
    navigation.navigate("TourDetail", { tour });
  };

  if (lists.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your lists..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

  
          <FlatList
            data={filteredLists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item: list }) => (
              <View style={styles.listCard}>
                <View style={styles.listHeader}>
                  <Text style={styles.listName}>{list.name}</Text>
                  <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                    <Text style={styles.tourCount}>{list.tours.length} saved</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteList(list.id, list.name)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF5A5F" />
                    </TouchableOpacity>
                  </View>
                </View>

                <FlatList
                  data={list.tours}
                  keyExtractor={(t) => t.id}
                  renderItem={({ item: tour }) => (
                    <TourSavedItem
                      tour={tour}
                      onView={handleViewTour}
                      onRemove={() =>
                        handleRemoveTour(list.id, tour.id, tour.title)
                      }
                    />
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
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
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
