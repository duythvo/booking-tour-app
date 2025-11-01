import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from "react-redux"; 
import { fetchSavedLists } from "../store/savedSlice";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch(); 

 
  const login = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Login success:", user.uid);

       
        dispatch(fetchSavedLists());
      })
      .catch((error) => {
        Alert.alert("Login Failed", error.message);
      });
  };

  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        navigation.replace("Main");
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(fetchSavedLists()); 
      }
    });
    return unsubscribe;
  }, [dispatch]); 

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
          <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 15 }}>
            Sign In to Your Account
          </Text>
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "gray" }}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={{
              fontSize: 17,
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 10,
              borderRadius: 5,
              width: 300,
              marginTop: 5,
            }}
            placeholder="Enter your email"
            placeholderTextColor={"gray"}
            autoCapitalize="none"
          />

          <Text style={{ fontSize: 15, fontWeight: "700", color: "gray", marginTop: 15 }}>
            Password
          </Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              fontSize: 17,
              borderWidth: 1,
              borderColor: "#ccc",
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
            marginTop: 30,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", textAlign: "center", fontSize: 16 }}>
            Login
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 20 }}>
          <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
            Don't have an account? Sign up
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
