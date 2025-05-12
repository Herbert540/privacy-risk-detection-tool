import { initializeApp } from "firebase/app";

import {getDatabase,  onValue, ref, update, get,set} from "firebase/database"
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useCallback, useState, useEffect } from "react";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
  
// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(firebase); 
const database = getDatabase(firebase); 
const storage = getStorage(firebase); 

// Export services for use in other files
export { auth, database, storage };

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return user;
  } catch (error) {
    console.error('Google sign-in failed:', error.message);
    throw error;
  }
};

export const signOut = () => firebaseSignOut(auth);

export const getRef = async (path) => {
const snapshot = await get(ref(database, path));
return snapshot.exists();
};

/// User email-password login/signup function
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error during user login:", error.message);
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error during user sign-up:", error.message);
    throw error;
  }
};

export const useAuthState = () => {
  const [user, setUser] = useState();
  useEffect(() => (
      onAuthStateChanged(auth, setUser)
  ), []);

  return [user];
};

export const useDbData = (path) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      // Reset state when path is invalid or null
      setData(null);
      setError(null);
      return;
    }

    const dbRef = ref(database, path);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setData(snapshot.val());
      },
      (err) => {
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [path]);

  return [data, error];
};

const makeResult = (error) => {
  const timestamp = Date.now();
  const message = error?.message || `Updated: ${new Date(timestamp).toLocaleString()}`;
  return { timestamp, error, message };
};

export const useDbAdd = (path) => {
  const [result, setResult] = useState(null);


  const add = async (data, key) => {
    try {
      const newRef = ref(database, `${path}/${key}`); 
      await set(newRef, data); 
      setResult({ message: 'Request added successfully!', error: false });
    } catch (error) {
      setResult({ message: error.message, error: true });
    }
  };

  return [add, result];
};

export const useDbUpdate = (path) => {
  const [result, setResult] = useState();
  const updateData = useCallback(async (value) => {

      if (!value || typeof value !== 'object') {
          console.error("Invalid value passed to updateData:", value);
          return;
      }

      const dbRef = ref(database, path);
      update(dbRef, value)
          .then(() => setResult(makeResult()))
          .catch((error) => {
              console.error("Error during Firebase update:", error);
              setResult(makeResult(error));
          });
  }, [path]);

  return [updateData, result];
};




