import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 1. Firebase configuration using credentials provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyBrN4Z-wR1sjnOKLl1wUAHmZVoLKvJ3kl4",
  authDomain: "animeverso.firebaseapp.com",
  projectId: "animeverso",
  storageBucket: "animeverso.firebasestorage.app",
  messagingSenderId: "768020960298",
  appId: "1:768020960298:web:399f030d26232934481f53"
};

let app = null;
let auth = null;
let db = null;
let isFirebaseEnabled = false;

// 2. Safely initialize Firebase (if keys are missing, fall back to LocalStorage mode)
if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log("🔥 Firebase initialized successfully!");
  } catch (error) {
    console.warn("⚠️ Failed to initialize Firebase. Falling back to local storage:", error.message);
  }
} else {
  console.log("ℹ️ No Firebase API Key found in environment variables. Running in LocalStorage-only mode.");
}

const googleProvider = isFirebaseEnabled ? new GoogleAuthProvider() : null;

// 3. Auth Actions
export const signInWithGoogle = async () => {
  if (!isFirebaseEnabled) {
    console.warn("Firebase is disabled. Google Login is unavailable.");
    throw new Error("Servicio de Firebase no configurado.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (!isFirebaseEnabled) return;
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// 4. Firestore Synchronization
export const saveUserData = async (uid, data) => {
  if (!isFirebaseEnabled || !db) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      favorites: data.favorites || [],
      history: data.history || [],
      continueWatching: data.continueWatching || [],
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving user data to Firestore:", error);
  }
};

export const getUserData = async (uid) => {
  if (!isFirebaseEnabled || !db) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error reading user data from Firestore:", error);
    return null;
  }
};

export { auth, db, isFirebaseEnabled };
