import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Modal, ActivityIndicator } from "react-native";
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
    console.log("ErrorBoundary caught", error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={styles.center}>
          <Text style={{ color: "red", fontWeight: "700", fontSize: 18 }}>
            Runtime error caught by ErrorBoundary
          </Text>
          <Text style={{ marginTop: 12 }}>{String(this.state.error)}</Text>
          <Text style={{ marginTop: 12, color: "gray" }}>
            {this.state.info?.componentStack}
          </Text>
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
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // ✅ Khởi tạo SQLite
      await initDatabase();
      
      // ✅ Kiểm tra booking chờ đồng bộ
      const pendingCount = await countPendingBookings();
      console.log(`📦 Có ${pendingCount} booking chờ đồng bộ`);
      
      // ✅ Bắt đầu auto sync
      const stopAutoSync = startAutoSync((result) => {
        if (result.success && result.results) {
          const { success, failed } = result.results;
          
          if (success.length > 0 || failed.length > 0) {
            setSyncStatus({
              success: success.length,
              failed: failed.length,
              details: result.results
            });
            setShowSyncModal(true);
            
            // Tự động đóng sau 5 giây
            setTimeout(() => {
              setShowSyncModal(false);
            }, 5000);
          }
        }
      });
      
      // Cleanup khi unmount
      return () => {
        if (stopAutoSync) stopAutoSync();
      };
      
    } catch (error) {
      console.error("Init error:", error);
    } finally {
      setIsReady(true);
    }
  };

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
        
        {/* ✅ MODAL ĐỒNG BỘ */}
        <Modal
          visible={showSyncModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSyncModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.syncModal}>
              <View style={styles.syncHeader}>
                <Ionicons name="cloud-upload" size={40} color="#4C67ED" />
                <Text style={styles.syncTitle}>Đồng bộ dữ liệu</Text>
              </View>
              
              {syncStatus && (
                <View style={styles.syncBody}>
                  {syncStatus.success > 0 && (
                    <View style={styles.syncRow}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <Text style={styles.syncText}>
                        ✅ Thành công: {syncStatus.success} booking
                      </Text>
                    </View>
                  )}
                  
                  {syncStatus.failed > 0 && (
                    <View style={styles.syncRow}>
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                      <Text style={styles.syncText}>
                        ❌ Thất bại: {syncStatus.failed} booking
                      </Text>
                    </View>
                  )}
                  
                  {/* CHI TIẾT FAILED */}
                  {syncStatus.details?.failed?.map((item, index) => (
                    <View key={index} style={styles.failedItem}>
                      <Text style={styles.failedReason}>
                        • {item.reason}
                      </Text>
                    </View>
                  ))}
                  
                  {/* CHI TIẾT SUCCESS */}
                  {syncStatus.details?.success?.map((item, index) => (
                    <View key={index} style={styles.successItem}>
                      <Text style={styles.successText}>
                        ✓ {item.tourTitle}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.syncFooter}>
                <Text style={styles.autoCloseText}>
                  Tự động đóng sau 5 giây
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </ErrorBoundary>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  center: {
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  syncModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  syncHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  syncTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginTop: 12,
  },
  syncBody: {
    marginVertical: 10,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  syncText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  failedItem: {
    marginLeft: 36,
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
  },
  failedReason: {
    color: "#C62828",
    fontSize: 14,
  },
  successItem: {
    marginLeft: 36,
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },
  successText: {
    color: "#2E7D32",
    fontSize: 14,
  },
  syncFooter: {
    marginTop: 16,
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  autoCloseText: {
    color: "#999",
    fontSize: 13,
    fontStyle: "italic",
  },
});