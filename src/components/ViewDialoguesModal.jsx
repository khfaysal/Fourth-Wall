import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isFirebaseConfigured } from "../firebase";
import { getApprovedDialogues } from "../services/dialogueService";
import { toggleFavourite, getFavouriteIds } from "../services/favouriteService";
import "./ViewDialoguesModal.css";

export default function ViewDialoguesModal({ movieId, movieName, onClose, onAddDialogue }) {
  const { currentUser } = useAuth();
  const [dialogues, setDialogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState(new Set());

  useEffect(() => {
    if (!isFirebaseConfigured || !movieId) return;

    async function fetchDialogues() {
      try {
        const list = await getApprovedDialogues(movieId);
        setDialogues(list);

        // Load favourite IDs for current user
        if (currentUser) {
          const ids = await getFavouriteIds(currentUser.uid);
          setFavIds(ids);
        }
      } catch (err) {
        console.error("Failed to fetch dialogues:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDialogues();
  }, [movieId, currentUser]);

  async function handleToggleFav(dlg) {
    if (!currentUser) {
      alert("Please log in to favourite dialogues.");
      return;
    }
    try {
      const added = await toggleFavourite(currentUser.uid, { ...dlg, movieName });
      setFavIds((prev) => {
        const next = new Set(prev);
        if (added) next.add(dlg.id);
        else next.delete(dlg.id);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  }

  return (
    <div className="dlg-overlay" onClick={onClose}>
      <div className="dlg-panel" onClick={(e) => e.stopPropagation()}>
        <div className="dlg-header">
          <div>
            <h2>{movieName}</h2>
            <p className="dlg-subtitle">
              {loading ? "Loading…" : `${dialogues.length} dialogue${dialogues.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="dlg-body">
          {loading ? (
            <div className="dlg-empty">Loading dialogues…</div>
          ) : dialogues.length === 0 ? (
            <div className="dlg-empty">
              <span className="dlg-empty-icon">💬</span>
              <p>No dialogues yet for this movie.</p>
              {currentUser && (
                <button className="dlg-add-btn" onClick={onAddDialogue}>
                  Be the first to add one →
                </button>
              )}
            </div>
          ) : (
            <div className="dlg-list">
              {dialogues.map((dlg) => (
                <div key={dlg.id} className="dlg-card">
                  <div className="dlg-card-content">
                    <div className="dlg-quote">
                      <span className="dlg-open-quote">"</span>
                      {dlg.dialogueText}
                      <span className="dlg-close-quote">"</span>
                    </div>
                    <div className="dlg-meta">
                      <span className="dlg-character">— {dlg.characterName}</span>
                      {dlg.targetCharacter && (
                        <span className="dlg-target"> to {dlg.targetCharacter}</span>
                      )}
                      <span className={`dlg-type dlg-type--${dlg.dialogueType?.toLowerCase()}`}>
                        {dlg.dialogueType}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`dlg-fav-btn ${favIds.has(dlg.id) ? "dlg-fav-active" : ""}`}
                    onClick={() => handleToggleFav(dlg)}
                    title={favIds.has(dlg.id) ? "Remove from favourites" : "Add to favourites"}
                    aria-label={favIds.has(dlg.id) ? "Remove from favourites" : "Add to favourites"}
                  >
                    {favIds.has(dlg.id) ? "★" : "☆"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {dialogues.length > 0 && currentUser && (
          <div className="dlg-footer">
            <button className="dlg-add-btn" onClick={onAddDialogue}>
              + Add a dialogue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
