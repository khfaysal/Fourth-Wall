import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addDialogue } from "../services/dialogueService";
import { getApprovedMovies } from "../services/movieService";
import { isFirebaseConfigured } from "../firebase";
import "./AuthModals.css";

export default function AddDialogueModal({ onClose, onDialogueAdded, preselectedMovieId }) {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState([]);
  const [movieId, setMovieId] = useState(preselectedMovieId || "");
  const [characterName, setCharacterName] = useState("");
  const [targetCharacter, setTargetCharacter] = useState("");
  const [dialogueType, setDialogueType] = useState("Serious");
  const [dialogueText, setDialogueText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  // Fetch movies for the dropdown
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    async function fetchMovies() {
      try {
        const list = await getApprovedMovies();
        setMovies(list);
        if (!preselectedMovieId && list.length > 0) {
          setMovieId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    }
    fetchMovies();
  }, [preselectedMovieId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!movieId) return setError("Please select a movie.");
    if (!characterName.trim()) return setError("Please enter the character name.");
    if (!dialogueText.trim()) return setError("Please enter the dialogue text.");
    if (!currentUser) return setError("You must be logged in to submit a dialogue.");

    setBusy(true);
    try {
      await addDialogue({
        movieId,
        characterName: characterName.trim(),
        targetCharacter: targetCharacter.trim(),
        dialogueType,
        dialogueText: dialogueText.trim(),
        createdBy: currentUser.uid,
      });
      setSuccess("Dialogue submitted! It will appear after admin approval.");
      setCharacterName("");
      setTargetCharacter("");
      setDialogueText("");
      if (onDialogueAdded) onDialogueAdded();
    } catch (err) {
      console.error("Failed to add dialogue:", err);
      setError(err.message || "Failed to submit dialogue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>Submit a dialogue</h2>
        <p className="subtitle">Add a memorable quote to the collection</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="dlg-movie">Movie / Series</label>
            <select
              id="dlg-movie"
              className="auth-select"
              value={movieId}
              onChange={(e) => setMovieId(e.target.value)}
              required
            >
              <option value="" disabled>Select a movie…</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>{m.movieName}</option>
              ))}
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="dlg-character">Character name</label>
            <input
              id="dlg-character"
              type="text"
              placeholder="e.g. Jack Sparrow"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="dlg-target">To character (optional)</label>
            <input
              id="dlg-target"
              type="text"
              placeholder="e.g. Will Turner"
              value={targetCharacter}
              onChange={(e) => setTargetCharacter(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="dlg-type">Dialogue type</label>
            <select
              id="dlg-type"
              className="auth-select"
              value={dialogueType}
              onChange={(e) => setDialogueType(e.target.value)}
            >
              <option value="Funny">Funny</option>
              <option value="Serious">Serious</option>
              <option value="Motivation">Motivation</option>
              <option value="Slang">Slang</option>
              <option value="Romantic">Romantic</option>
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="dlg-text">Dialogue</label>
            <textarea
              id="dlg-text"
              className="auth-textarea"
              placeholder={'"I\'m the king of the world!"'}
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
              rows={3}
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Submitting…" : "Submit dialogue"}
          </button>
        </form>

        {!currentUser && (
          <p className="auth-switch" style={{ marginTop: "16px" }}>
            You need to be logged in to submit a dialogue.
          </p>
        )}
      </div>
    </div>
  );
}
