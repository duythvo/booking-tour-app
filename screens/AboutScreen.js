// screens/AboutScreen.js
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function AboutScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>About App</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: "https://via.placeholder.com/120" }} // Thay bằng logo app
                        style={styles.logo}
                    />
                    <Text style={styles.appName}>TourBooking</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

                {/* Description */}
                <Text style={styles.sectionTitle}>Welcome to TourBooking!</Text>
                <Text style={styles.description}>
                    Your ultimate travel companion for discovering and booking amazing tours
                    around the world. Explore thousands of hand-picked experiences, from city
                    adventures to nature escapes.
                </Text>

                <Text style={styles.sectionTitle}>Features</Text>
                <View style={styles.featureList}>
                    {[
                        "Browse thousands of tours",
                        "Save your favorite destinations",
                        "Secure booking with multiple payment options",
                        "24/7 customer support",
                        "Real traveler reviews",
                    ].map((feature, i) => (
                        <View key={i} style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#4C67ED" />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Our Mission</Text>
                <Text style={styles.description}>
                    To make travel accessible, memorable, and hassle-free for everyone.
                </Text>

                {/* Social Links */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity
                        style={styles.socialBtn}
                        onPress={() => Linking.openURL("https://facebook.com")}
                    >
                        <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialBtn}
                        onPress={() => Linking.openURL("https://instagram.com")}
                    >
                        <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialBtn}
                        onPress={() => Linking.openURL("https://twitter.com")}
                    >
                        <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.copyright}>
                    © 2025 TourBooking. All rights reserved.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9f9f9" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#003580",
        padding: 16,
        paddingTop: 50,
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    content: { padding: 20 },
    logoContainer: { alignItems: "center", marginBottom: 30 },
    logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 12 },
    appName: { fontSize: 24, fontWeight: "bold", color: "#003580" },
    version: { fontSize: 14, color: "#777", marginTop: 4 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#222",
        marginTop: 24,
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: "#555",
        lineHeight: 22,
        textAlign: "justify",
    },
    featureList: { marginLeft: 8 },
    featureItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    featureText: { marginLeft: 8, fontSize: 15, color: "#444" },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginVertical: 30,
    },
    socialBtn: {
        width: 50,
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    copyright: {
        textAlign: "center",
        color: "#999",
        fontSize: 13,
        marginTop: 30,
        marginBottom: 20,
    },
});