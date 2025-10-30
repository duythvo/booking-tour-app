import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const login = () => {
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      console.log("user credential", userCredential);
      const user = userCredential.user;
      console.log("user details", user);
    });
  };

  useEffect(() => {
    try {
      const unsubcribe = auth.onAuthStateChanged((authUser) => {
        if (authUser) {
          navigation.navigate("Main");
        }
      });
      return unsubcribe;
    } catch (error) {
      console.log(error);
    }
  }, []);
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
            Sign in
          </Text>
          <Text>Sign In to Your Account</Text>
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
        </View>
        <Pressable
          onPress={login}
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
            Login
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 20 }}
        >
          <Text style={{ textAlign: "center", color: "gray", fontSize: 17 }}>
            Don't have an acount? Sign up
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
