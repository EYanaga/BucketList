// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyDu0Hu8mUMWOU3Um-TaPMN8mLORzlKzzP0",
  authDomain: "bucketlist-e6bd9.firebaseapp.com",
  projectId: "bucketlist-e6bd9",
  storageBucket: "bucketlist-e6bd9.firebasestorage.app",
  messagingSenderId: "73386313872",
  appId: "1:73386313872:web:592af0d40e4be73a2ef015",
  measurementId: "G-9EKW7RT25F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
