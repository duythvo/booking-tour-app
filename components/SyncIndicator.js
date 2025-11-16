import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { countPendingBookings } from "../services/database";
import { checkNetworkStatus, syncAllPendingBookings } from "../services/syncService";

export default function SyncIndicator() {
    const [pendingCount, setPendingCount] = useState(0);
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (pendingCount > 0) {
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        } else {
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }
    }, [pendingCount]);

    const checkStatus = async () => {
        const count = await countPendingBookings();
        const online = await checkNetworkStatus();
        setPendingCount(count);
        setIsOnline(online);

        if (online && count > 0 && !isSyncing) {
            handleManualSync();
        }
    };

    const handleManualSync = async () => {
        if (isSyncing || !isOnline || pendingCount === 0) return;
        setIsSyncing(true);

        try {
            await syncAllPendingBookings();
        } catch (error) {
            console.error("Manual sync error:", error);
        } finally {
            await checkStatus();
            setIsSyncing(false);
        }
    };

    if (pendingCount === 0) return null;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
                style={[styles.badge, { backgroundColor: isOnline ? "#4CAF50" : "#FF9800" }]}
                onPress={handleManualSync}
                disabled={!isOnline || isSyncing}
                activeOpacity={0.8}
            >
                {isSyncing ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons name={isOnline ? "cloud-upload" : "cloud-offline"} size={18} color="#fff" />
                )}
                <Text style={styles.text}>
                    {isSyncing ? "Đang đồng bộ..." : isOnline ? `${pendingCount} booking chờ` : `${pendingCount} offline`}
                </Text>
                {isOnline && !isSyncing && <Ionicons name="refresh" size={16} color="#fff" />}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { position: "absolute", top: 60, right: 20, zIndex: 1000 },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        gap: 6,
    },
    text: { color: "#fff", fontSize: 13, fontWeight: "600" },
});