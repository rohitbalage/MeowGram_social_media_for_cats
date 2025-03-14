// firebase.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Initialize Firebase services
const db = firestore();
const storageRef = storage();
const authRef = auth();

// Export initialized services
export { authRef as auth, db, storageRef as storage };