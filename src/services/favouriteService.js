import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Toggle a dialogue as favourite for a user.
 * Stores the full dialogue data so we can display it in the favourites modal.
 */
export async function toggleFavourite(uid, dialogue) {
  const ref = doc(db, "users", uid, "favourites", dialogue.id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref);
    return false; // un-favourited
  } else {
    await setDoc(ref, {
      dialogueId: dialogue.id,
      dialogueText: dialogue.dialogueText,
      characterName: dialogue.characterName,
      targetCharacter: dialogue.targetCharacter || "",
      movieId: dialogue.movieId || "",
      movieName: dialogue.movieName || "",
      favouritedAt: new Date(),
    });
    return true; // favourited
  }
}

/**
 * Get all favourited dialogues for a user.
 */
export async function getFavourites(uid) {
  const snap = await getDocs(collection(db, "users", uid, "favourites"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Check if a specific dialogue is favourited by the user.
 */
export async function isFavourited(uid, dialogueId) {
  const ref = doc(db, "users", uid, "favourites", dialogueId);
  const snap = await getDoc(ref);
  return snap.exists();
}

/**
 * Get favourite IDs as a Set (bulk check).
 */
export async function getFavouriteIds(uid) {
  const snap = await getDocs(collection(db, "users", uid, "favourites"));
  return new Set(snap.docs.map((d) => d.id));
}
