import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addDialogue, getApprovedDialogues } from "../services/dialogueService";
import { getApprovedMovies } from "../services/movieService";
import { isFirebaseConfigured } from "../firebase";
import "./AuthModals.css";

/**
 * A text input with autocomplete suggestions dropdown.
 */
function AutocompleteInput({ id, value, onChange, suggestions, placeholder, required }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Filter suggestions based on current input value
  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return suggestions; // show all when input is empty but focused
    return suggestions.filter((s) => s.toLowerCase().includes(query));
  }, [value, suggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e) {
    if (!showSuggestions || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      onChange({ target: { value: filtered[focusedIndex] } });
      setShowSuggestions(false);
      setFocusedIndex(-1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(name) {
    onChange({ target: { value: name } });
    setShowSuggestions(false);
    setFocusedIndex(-1);
  }

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e);
          setShowSuggestions(true);
          setFocusedIndex(-1);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        required={required}
        autoComplete="off"
      />
      {showSuggestions && filtered.length > 0 && (
        <ul className="autocomplete-dropdown">
          {filtered.map((name, idx) => (
            <li
              key={name}
              className={`autocomplete-item ${idx === focusedIndex ? "autocomplete-item-active" : ""}`}
              onMouseDown={() => selectSuggestion(name)}
              onMouseEnter={() => setFocusedIndex(idx)}
            >
              <span className="autocomplete-avatar">{name.charAt(0).toUpperCase()}</span>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddDialogueModal({ onClose, onDialogueAdded, preselectedMovieId }) {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState([]);
  const [movieId, setMovieId] = useState(preselectedMovieId || "");
  const [characterName, setCharacterName] = useState("");
  const [targetCharacter, setTargetCharacter] = useState("");
  const [dialogueText, setDialogueText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [existingCharacters, setExistingCharacters] = useState([]);

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

  // Fetch existing character names when a movie is selected
  useEffect(() => {
    if (!isFirebaseConfigured || !movieId) {
      setExistingCharacters([]);
      return;
    }
    async function fetchCharacters() {
      try {
        const dialogues = await getApprovedDialogues(movieId);
        // Collect unique character names (both characterName and targetCharacter)
        const names = new Set();
        for (const dlg of dialogues) {
          if (dlg.characterName?.trim()) names.add(dlg.characterName.trim());
          if (dlg.targetCharacter?.trim()) names.add(dlg.targetCharacter.trim());
        }
        setExistingCharacters(Array.from(names).sort());
      } catch (err) {
        console.error("Failed to fetch character names:", err);
        setExistingCharacters([]);
      }
    }
    fetchCharacters();
  }, [movieId]);

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
            <AutocompleteInput
              id="dlg-character"
              placeholder="e.g. Jack Sparrow"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              suggestions={existingCharacters}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="dlg-target">To character (optional)</label>
            <AutocompleteInput
              id="dlg-target"
              placeholder="e.g. Will Turner"
              value={targetCharacter}
              onChange={(e) => setTargetCharacter(e.target.value)}
              suggestions={existingCharacters}
            />
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
