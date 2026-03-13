import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addMovie } from "../services/movieService";
import "./AuthModals.css";

export default function AddMovieModal({ onClose, onMovieAdded }) {
  const { currentUser } = useAuth();
  const [movieName, setMovieName] = useState("");
  const [bannerURL, setBannerURL] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!movieName.trim()) {
      return setError("Please enter a movie name.");
    }

    if (!currentUser) {
      return setError("You must be logged in to add a movie.");
    }

    setBusy(true);
    try {
      await addMovie({
        movieName: movieName.trim(),
        bannerURL: bannerURL.trim(),
        createdBy: currentUser.uid,
      });
      setSuccess("Movie submitted! It will appear after admin approval.");
      setMovieName("");
      setBannerURL("");
      if (onMovieAdded) onMovieAdded();
    } catch (err) {
      console.error("Failed to add movie:", err);
      setError("Failed to submit movie. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>Add a movie</h2>
        <p className="subtitle">Submit a movie or series for the community</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="movie-name">Movie / Series name</label>
            <input
              id="movie-name"
              type="text"
              placeholder="e.g. Inception, Breaking Bad"
              value={movieName}
              onChange={(e) => setMovieName(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="movie-banner">Banner image URL (optional)</label>
            <input
              id="movie-banner"
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={bannerURL}
              onChange={(e) => setBannerURL(e.target.value)}
            />
          </div>

          {bannerURL && (
            <div className="banner-preview">
              <img
                src={bannerURL}
                alt="Banner preview"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Submitting…" : "Submit movie"}
          </button>
        </form>

        {!currentUser && (
          <p className="auth-switch" style={{ marginTop: "16px" }}>
            You need to be logged in to add a movie.
          </p>
        )}
      </div>
    </div>
  );
}
