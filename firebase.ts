// firebase.ts
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

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

export const authInstance = auth();
export const firestoreInstance = firestore();
export const storageInstance = storage();

