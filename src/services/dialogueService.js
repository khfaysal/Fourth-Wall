import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "dialogues";

/**
 * Add a new dialogue (pending approval).
 */
export async function addDialogue({
  movieId,
  characterName,
  targetCharacter,
  dialogueText,
  createdBy,
}) {
  return addDoc(collection(db, COLLECTION), {
    movieId,
    characterName,
    targetCharacter: targetCharacter || "",
    dialogueText,
    createdBy: createdBy || "anonymous",
    approved: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Get approved dialogues for a specific movie.
 */
export async function getApprovedDialogues(movieId) {
  const q = query(
    collection(db, COLLECTION),
    where("movieId", "==", movieId),
    where("approved", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get the count of approved dialogues for a specific movie.
 */
export async function getDialogueCountForMovie(movieId) {
  const q = query(
    collection(db, COLLECTION),
    where("movieId", "==", movieId),
    where("approved", "==", true)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Get all pending (unapproved) dialogues across all movies.
 */
export async function getPendingDialogues() {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", false)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get total count of approved dialogues (all movies).
 */
export async function getTotalDialogueCount() {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", true)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Get total count of pending dialogues.
 */
export async function getPendingDialogueCount() {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", false)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Approve a dialogue by ID.
 */
export async function approveDialogue(dialogueId) {
  const ref = doc(db, COLLECTION, dialogueId);
  return updateDoc(ref, { approved: true });
}

/**
 * Delete a dialogue by ID.
 */
export async function deleteDialogue(dialogueId) {
  const ref = doc(db, COLLECTION, dialogueId);
  return deleteDoc(ref);
}

/**
 * Update an existing dialogue.
 */
export async function updateDialogue(dialogueId, data) {
  const ref = doc(db, COLLECTION, dialogueId);
  return updateDoc(ref, data);
}

/**
 * Get all approved dialogues (for Admin Panel processing).
 */
export async function getAllApprovedDialogues() {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", true)
  );
  const snapshot = await getDocs(q);
  const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  // Sort by createdAt descending on the client to avoid needing a composite index
  return list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
}
