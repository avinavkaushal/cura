import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // Adjust path if needed
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // This holds the personalized name, etc.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. User is logged in, set the basic auth user
        setCurrentUser(user);

        // 2. IMPORTANT: Fetch the personalized data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.warn("No profile document found for this user in Firestore!");
          setUserData(null);
        }
      } else {
        // User is logged out
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false); // Done checking auth and fetching data
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, []);

  const value = {
    currentUser,
    userData, // { name: 'Aarav Sharma', orphanage_name: 'Hope Center', etc. }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}