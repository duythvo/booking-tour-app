// App.js

import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Modal, ActivityIndicator, TouchableOpacity } from "react-native";
import { Provider } from "react-redux";
import store from "./store/store";
import StackNavigator from "./StackNavigator";
import { initDatabase, countPendingBookings } from "./services/database";
import { startAutoSync } from "./services/syncService";
import { Ionicons } from "@expo/vector-icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={styles.center}>
          <Text style={{ color: "red", fontWeight: "700", fontSize: 18 }}>Runtime error</Text>
          <Text style={{ marginTop: 12 }}>{String(this.state.error)}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    let stopAutoSync;
    const initApp = async () => {
      try {
        await initDatabase();
        await countPendingBookings();

        stopAutoSync = startAutoSync((result) => {
          if (result.success && result.results && (result.results.success.length > 0 || result.results.failed.length > 0)) {
            setSyncStatus(result.results);
            setShowSyncModal(true);
            setTimeout(() => setShowSyncModal(false), 8000);
          }
        });
      } catch (error) {
        console.error("Init error:", error);
      } finally {
        setIsReady(true);
      }
    };
    initApp();
    return () => stopAutoSync && stopAutoSync();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C67ED" />
        <Text style={styles.loadingText}>Đang khởi tạo...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <StackNavigator />

        <Modal visible={showSyncModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.syncModal}>
              <View style={styles.syncHeader}>
                <Ionicons name="cloud-done" size={50} color="#4C67ED" />
                <Text style={styles.syncTitle}>Đồng bộ hoàn tất</Text>
              </View>

              {syncStatus && (
                <View style={styles.syncBody}>
                  {syncStatus.success.length > 0 && (
                    <View style={styles.successSection}>
                      <View style={styles.syncRow}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        <Text style={styles.syncText}>Thành công: {syncStatus.success.length}</Text>
                      </View>
                      {syncStatus.success.map((item, i) => (
                        <View key={i} style={styles.successItem}>
                          <Ionicons name="checkmark" size={16} color="#2E7D32" />
                          <Text style={styles.successText}>{item.tourTitle}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {syncStatus.failed.length > 0 && (
                    <View style={styles.failedSection}>
                      <View style={styles.syncRow}>
                        <Ionicons name="close-circle" size={24} color="#F44336" />
                        <Text style={styles.syncText}>Thất bại: {syncStatus.failed.length}</Text>
                      </View>
                      {syncStatus.failed.map((item, i) => (
                        <View key={i} style={styles.failedItem}>
                          <Ionicons name="warning" size={16} color="#C62828" />
                          <Text style={styles.failedReason}>{item.reason}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSyncModal(false)}>
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
              <Text style={styles.autoCloseText}>Tự động đóng sau 8 giây</Text>
            </View>
          </View>
        </Modal>
        <StatusBar style="auto" />


      </ErrorBoundary>
    </Provider >
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },
  center: { padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  syncModal: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "90%", maxHeight: "80%", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  syncHeader: { alignItems: "center", marginBottom: 20 },
  syncTitle: { fontSize: 22, fontWeight: "700", color: "#222", marginTop: 12 },
  syncBody: { marginVertical: 10 },
  successSection: { marginBottom: 16 },
  failedSection: { marginTop: 8 },
  syncRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, padding: 12, backgroundColor: "#f9f9f9", borderRadius: 10 },
  syncText: { marginLeft: 12, fontSize: 16, fontWeight: "600", color: "#333" },
  successItem: { flexDirection: "row", alignItems: "center", marginLeft: 20, marginBottom: 8, padding: 10, backgroundColor: "#E8F5E9", borderRadius: 8 },
  successText: { marginLeft: 8, color: "#2E7D32", fontSize: 14, flex: 1 },
  failedItem: { flexDirection: "row", alignItems: "center", marginLeft: 20, marginBottom: 8, padding: 10, backgroundColor: "#FFEBEE", borderRadius: 8 },
  failedReason: { marginLeft: 8, color: "#C62828", fontSize: 14, flex: 1 },
  closeButton: { backgroundColor: "#4C67ED", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 16 },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  autoCloseText: { textAlign: "center", color: "#999", fontSize: 13, fontStyle: "italic", marginTop: 12 },
});