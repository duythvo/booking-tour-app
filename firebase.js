import { getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDOvx5t4P1O9280bm9mH4i081cU7fp-qoM",
  authDomain: "booking-tour-project-5d086.firebaseapp.com",
  projectId: "booking-tour-project-5d086",
  storageBucket: "booking-tour-project-5d086.firebasestorage.app",
  messagingSenderId: "317333256179",
  appId: "1:317333256179:web:2a35915db969286e6fc486",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore();

export { auth, db };
