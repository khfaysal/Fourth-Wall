import {
  collection,
  addDoc,
  getDocs,
  getDoc,
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

const COLLECTION = "movies";

/**
 * Add a new movie (pending approval).
 */
export async function addMovie({ movieName, bannerURL, createdBy }) {
  return addDoc(collection(db, COLLECTION), {
    movieName,
    bannerURL: bannerURL || "",
    createdBy: createdBy || "anonymous",
    approved: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Get all approved movies, ordered by creation date (newest first).
 */
export async function getApprovedMovies() {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get all pending (unapproved) movies.
 */
export async function getPendingMovies() {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", false)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get the total count of approved movies.
 */
export async function getApprovedMovieCount() {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", true)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Get the total count of pending movies.
 */
export async function getPendingMovieCount() {
  const q = query(
    collection(db, COLLECTION),
    where("approved", "==", false)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Approve a movie by ID.
 */
export async function approveMovie(movieId) {
  const ref = doc(db, COLLECTION, movieId);
  return updateDoc(ref, { approved: true });
}

/**
 * Delete a movie by ID.
 */
export async function deleteMovie(movieId) {
  const ref = doc(db, COLLECTION, movieId);
  return deleteDoc(ref);
}

/**
 * Get a single movie by ID.
 */
export async function getMovieById(movieId) {
  const ref = doc(db, COLLECTION, movieId);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
}
