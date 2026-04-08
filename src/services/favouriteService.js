import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Add a dialogue to the user's favourites.
 */
export async function addFavourite(uid, dialogue) {
  const ref = doc(db, "users", uid, "favourites", dialogue.id);
  await setDoc(ref, {
    dialogueId: dialogue.id,
    dialogueText: dialogue.dialogueText,
    characterName: dialogue.characterName,
    targetCharacter: dialogue.targetCharacter || "",
    movieId: dialogue.movieId || "",
    movieName: dialogue.movieName || "",
    favouritedAt: new Date(),
  });
}

/**
 * Remove a dialogue from the user's favourites.
 */
export async function removeFavourite(uid, dialogueId) {
  const ref = doc(db, "users", uid, "favourites", dialogueId);
  await deleteDoc(ref);
}

/**
 * Get all favourited dialogues for a user.
 */
export async function getFavourites(uid) {
  const snap = await getDocs(collection(db, "users", uid, "favourites"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get favourite IDs as a Set (bulk check).
 */
export async function getFavouriteIds(uid) {
  const snap = await getDocs(collection(db, "users", uid, "favourites"));
  return new Set(snap.docs.map((d) => d.id));
}
