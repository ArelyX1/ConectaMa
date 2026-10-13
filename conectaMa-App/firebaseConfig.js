import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence,
  getAuth 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhNKEw_KuHlsYVDJ53Q0fqhNJdQdzM2W0",
  authDomain: "conectama-77417.firebaseapp.com",
  databaseURL: "https://conectama-77417-default-rtdb.firebaseio.com",
  projectId: "conectama-77417",
  storageBucket: "conectama-77417.firebasestorage.app",
  messagingSenderId: "819091078658",
  appId: "1:819091078658:web:833a227b5dcdeb16a4711b",
  measurementId: "G-34WYZ5YXCG"
};

// Inicializar Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializar Auth con persistencia para React Native
let auth;
try {
  // Primero intentar con initializeAuth para React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Si falla, usar getAuth (útil para web)
  auth = getAuth(app);
}

const db = getFirestore(app);
const realtimeDb = getDatabase(app);

export { app, auth, db, realtimeDb };