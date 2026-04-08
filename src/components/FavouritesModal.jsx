import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isFirebaseConfigured } from "../firebase";
import { getFavourites, removeFavourite } from "../services/favouriteService";
import "./FavouritesModal.css";

export default function FavouritesModal({ onClose }) {
  const { currentUser } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !currentUser) return;

    async function fetch() {
      try {
        const list = await getFavourites(currentUser.uid);
        setFavourites(list);
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [currentUser]);

  async function handleRemove(fav) {
    try {
      await removeFavourite(currentUser.uid, fav.id);
      setFavourites((prev) => prev.filter((f) => f.id !== fav.id));
    } catch (err) {
      console.error("Failed to remove favourite:", err);
      alert("Failed to remove favourite. Please try again.");
    }
  }

  return (
    <div className="fav-overlay" onClick={onClose}>
      <div className="fav-panel" onClick={(e) => e.stopPropagation()}>
        <div className="fav-header">
          <div>
            <h2>⭐ My Favourites</h2>
            <p className="fav-subtitle">
              {loading ? "Loading…" : `${favourites.length} saved dialogue${favourites.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="fav-body">
          {loading ? (
            <div className="fav-empty">Loading favourites…</div>
          ) : favourites.length === 0 ? (
            <div className="fav-empty">
              <span className="fav-empty-icon">⭐</span>
              <p>No favourites yet.</p>
              <p className="fav-hint">Click the star beside any dialogue to save it here!</p>
            </div>
          ) : (
            <div className="fav-list">
              {favourites.map((fav) => (
                <div key={fav.id} className="fav-card">
                  <div className="fav-content">
                    <div className="fav-quote">"{fav.dialogueText}"</div>
                    <div className="fav-meta">
                      <span className="fav-character">— {fav.characterName}</span>
                      {fav.targetCharacter && (
                        <span className="fav-target"> to {fav.targetCharacter}</span>
                      )}
                      {fav.movieName && (
                        <span className="fav-movie">· {fav.movieName}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="fav-remove"
                    onClick={() => handleRemove(fav)}
                    title="Remove from favourites"
                    aria-label="Remove from favourites"
                  >
                    ★
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
