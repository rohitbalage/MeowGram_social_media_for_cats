// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCH8mT6Wwu4FRQ_CPvolAjc_UVydUFI2sU",
  authDomain: "meowgram-86a8f.firebaseapp.com",
  projectId: "meowgram-86a8f",
  storageBucket: "meowgram-86a8f.firebasestorage.app",
  messagingSenderId: "69015713322",
  appId: "1:69015713322:web:d10c03f7395661c14e7553",
  measurementId: "G-8V9YDHZS2E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
