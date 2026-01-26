// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOu6K-EIXHCTkBkf4kQflxl2Smv1Gtpro",
  authDomain: "prepwise-f09b7.firebaseapp.com",
  projectId: "prepwise-f09b7",
  storageBucket: "prepwise-f09b7.firebasestorage.app",
  messagingSenderId: "164047330745",
  appId: "1:164047330745:web:c92282f40b0c8d7b0caa68",
  measurementId: "G-DKK0NCGB5Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
