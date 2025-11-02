import { View, Text } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons";

// === CÁC MÀN HÌNH ===
import HomeCreen from "./screens/HomeScreen";
import SavedScreen from "./screens/SavedScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import TourDetail from "./screens/TourDetail";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PaymentOptionScreen from "./screens/PaymentOptionScreen";
import BookingScreen from "./screens/BookingScreen";

// === MÀN HÌNH BOOKING MỚI ===
import MyBookingsScreen from "./screens/MyBookingScreen";
import BookingDetailScreen from "./screens/BookingDetailScreen";

import EditProfileScreen from "./screens/EditProfileScreen";

import AboutScreen from "./screens/AboutScreen";
import ContactScreen from "./screens/ContactScreen";

import { NavigationContainer } from "@react-navigation/native";

export default function StackNavigator() {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();

  // === BOTTOM TABS VỚI TAB BOOKINGS MỚI ===
  const BottomTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#003580",
          tabBarInactiveTintColor: "black",
          tabBarStyle: { height: 60, paddingBottom: 8 },
        }}
      >
        {/* HOME */}
        <Tab.Screen
          name="Home"
          component={HomeCreen}
          options={{
            tabBarLabel: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Entypo name="home" size={26} color="#003580" />
              ) : (
                <AntDesign name="home" size={26} color="black" />
              ),
          }}
        />

        {/* SAVED */}
        <Tab.Screen
          name="Saved"
          component={SavedScreen}
          options={{
            tabBarLabel: "Saved",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <AntDesign name="heart" size={26} color="#003580" />
              ) : (
                <Feather name="heart" size={26} color="black" />
              ),
          }}
        />

        {/* BOOKINGS - TAB MỚI */}
        <Tab.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{
            tabBarLabel: "Bookings",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="receipt" size={26} color="#003580" />
              ) : (
                <Ionicons name="receipt-outline" size={26} color="black" />
              ),
          }}
        />

        {/* PROFILE */}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="person" size={26} color="#003580" />
              ) : (
                <Ionicons name="person-outline" size={26} color="black" />
              ),
          }}
        />
      </Tab.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* AUTH */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        {/* MAIN APP */}
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />

        {/* DETAIL SCREENS */}
        <Stack.Screen
          name="TourDetail"
          component={TourDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Bookings"
          component={BookingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentOption"
          component={PaymentOptionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentMethod"
          component={PaymentMethodScreen}
          options={{ headerShown: false }}
        />

        {/* BOOKING SCREENS */}
        <Stack.Screen
          name="BookingDetail"
          component={BookingDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />

        <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}