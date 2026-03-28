import React, { useState } from "react";
import { updateMovie } from "../services/movieService";
import "./AuthModals.css";

export default function EditMovieModal({ movie, onClose, onMovieUpdated }) {
  const [movieName, setMovieName] = useState(movie.movieName || "");
  const [bannerURL, setBannerURL] = useState(movie.bannerURL || "");
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

    setBusy(true);
    try {
      await updateMovie(movie.id, {
        movieName: movieName.trim(),
        bannerURL: bannerURL.trim(),
      });
      setSuccess("Movie updated successfully!");
      if (onMovieUpdated) onMovieUpdated();
      setTimeout(onClose, 1000); // close after a short delay
    } catch (err) {
      console.error("Failed to update movie:", err);
      setError("Failed to update movie. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>Edit Movie</h2>
        <p className="subtitle">Update the details for this movie</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="edit-movie-name">Movie / Series name</label>
            <input
              id="edit-movie-name"
              type="text"
              value={movieName}
              onChange={(e) => setMovieName(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="edit-movie-banner">Banner image URL (optional)</label>
            <input
              id="edit-movie-banner"
              type="url"
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
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
