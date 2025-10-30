import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const navigation = useNavigation();
  const register = () => {
    if (email === "" || password === "" || phone === "") {
      Alert.alert(
        "Invalid Details",
        "Please fill all the details",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => console.log("OK Pressed"),
          },
        ],
        { cancelable: true }
      );
    }
    createUserWithEmailAndPassword(auth, email, password).then(
      (userCredential) => {
        // Signed in
        const user = userCredential._tokenResponse.email;
        const uid = auth.currentUser.uid;
        setDoc(doc(db,"users", `${uid}`),{
          email: user,
          phone: phone
        })
      }
    );
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
        padding: 10,
        alignItems: "center",
      }}
    >
      <KeyboardAvoidingView>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 100,
          }}
        >
          <Text style={{ color: "#003580", fontSize: 17, fontWeight: "600" }}>
            Register
          </Text>
          <Text>Create an account</Text>
        </View>
        <View style={{ gap: 10 }}>
          <Text
            style={{
              marginLeft: 2,
              fontSize: 15,
              fontWeight: "700",
              color: "gray",
            }}
          >
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={{
              fontSize: email ? 17 : 17,
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              width: 300,
              marginTop: 5,
            }}
            placeholder="Enter your email"
            placeholderTextColor={"gray"}
          />
          <Text
            style={{
              marginLeft: 2,
              fontSize: 15,
              fontWeight: "700",
              color: "gray",
            }}
          >
            Password
          </Text>
          <TextInput
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={{
              fontSize: password ? 17 : 17,
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              width: 300,
              marginTop: 5,
            }}
            placeholder="Enter your password"
            placeholderTextColor={"gray"}
          />
          <Text
            style={{
              marginLeft: 2,
              fontSize: 15,
              fontWeight: "700",
              color: "gray",
            }}
          >
            Phone No
          </Text>
          <TextInput
            value={phone}
            onChangeText={(text) => setPhone(text)}
            style={{
              fontSize: phone ? 17 : 17,
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              width: 300,
              marginTop: 5,
            }}
            placeholder="Enter your phone number"
            placeholderTextColor={"gray"}
          />
        </View>
        <Pressable
          onPress={register}
          style={{
            backgroundColor: "#003580",
            width: 300,
            padding: 14,
            borderRadius: 5,
            marginTop: 20,
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "bold", textAlign: "center" }}
          >
            Register
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={{ marginTop: 20 }}
        >
          <Text style={{ textAlign: "center", color: "gray", fontSize: 17 }}>
            Already have an acount? Sign in
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
