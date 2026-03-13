import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { createUserProfile, getUserProfile } from "../services/userService";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Firestore profile (has role)
  const [loading, setLoading] = useState(isFirebaseConfigured); // Only block render if Firebase is configured

  /**
   * Sign up with email & password, then create Firestore user profile.
   */
  async function signUp(email, password, displayName) {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    const profile = await createUserProfile(credential.user.uid, {
      name: displayName,
      email: credential.user.email,
    });
    setUserProfile(profile);
    return credential;
  }

  /**
   * Log in with email & password.
   */
  async function login(email, password) {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(credential.user.uid);
    setUserProfile(profile);
    return credential;
  }

  /**
   * Sign in with Google popup, then upsert Firestore user profile.
   */
  async function signInWithGoogle() {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await createUserProfile(result.user.uid, {
      name: result.user.displayName,
      email: result.user.email,
    });
    setUserProfile(profile);
    return result;
  }

  /**
   * Logout.
   */
  function logout() {
    if (!isFirebaseConfigured) return;
    setUserProfile(null);
    return signOut(auth);
  }

  useEffect(() => {
    // If Firebase isn't configured, skip auth listener entirely
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isFirebaseConfigured,
    signUp,
    login,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
