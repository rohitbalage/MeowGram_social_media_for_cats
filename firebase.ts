import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCH8mT6Wwu4FRQ_CPvolAjc_UVydUFI2sU",
  authDomain: "meowgram-86a8f.firebaseapp.com",
  projectId: "meowgram-86a8f",
  storageBucket: "meowgram-86a8f.appspot.com",
  messagingSenderId: "69015713322",
  appId: "1:69015713322:web:d10c03f7395661c14e7553",
  measurementId: "G-8V9YDHZS2E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };