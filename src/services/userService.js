import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Create a user profile document in Firestore.
 * Called after sign-up (email/password) or first Google sign-in.
 */
export async function createUserProfile(uid, { name, email }) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  // Only create if the doc doesn't already exist (idempotent)
  if (!snapshot.exists()) {
    await setDoc(userRef, {
      name: name || "",
      email: email || "",
      role: "user",
      createdAt: serverTimestamp(),
    });
  }

  return getUserProfile(uid);
}

/**
 * Fetch a user profile from Firestore.
 */
export async function getUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return { uid, ...snapshot.data() };
  }

  return null;
}
