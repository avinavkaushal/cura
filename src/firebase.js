import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDzJ-cDfqNj0QC7bZ9llFwBHJtvfB3OnpI",
  authDomain: "cura-d23bc.firebaseapp.com",
  databaseURL: "https://cura-d23bc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cura-d23bc",
  storageBucket: "cura-d23bc.firebasestorage.app",
  messagingSenderId: "316042878423",
  appId: "1:316042878423:web:9669a18bd3a0cd70343f92",
  measurementId: "G-PF01VR0MLK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 
export const auth = getAuth(app);