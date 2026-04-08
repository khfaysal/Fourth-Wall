import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isFirebaseConfigured } from "../firebase";
import { getApprovedDialogues } from "../services/dialogueService";
import { addFavourite, removeFavourite, getFavouriteIds } from "../services/favouriteService";
import "./ViewDialoguesModal.css";

export default function ViewDialoguesModal({ movieId, movieName, onClose, onAddDialogue }) {
  const { currentUser } = useAuth();
  const [dialogues, setDialogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState(new Set());
  const [togglingIds, setTogglingIds] = useState(new Set()); // track in-progress toggles
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !movieId) return;

    async function fetchDialogues() {
      try {
        const list = await getApprovedDialogues(movieId);
        setDialogues(list);

        // Load favourite IDs for current user
        if (currentUser) {
          try {
            const ids = await getFavouriteIds(currentUser.uid);
            setFavIds(ids);
          } catch (favErr) {
            console.error("Failed to fetch favourite IDs:", favErr);
            // Don't block dialogues from showing if favourites fail
          }
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

    // Prevent double-clicks
    if (togglingIds.has(dlg.id)) return;

    setTogglingIds((prev) => new Set(prev).add(dlg.id));
    setError(null);

    try {
      const isFav = favIds.has(dlg.id);

      // Optimistic update: update UI immediately
      setFavIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(dlg.id);
        else next.add(dlg.id);
        return next;
      });

      try {
        if (isFav) {
          await removeFavourite(currentUser.uid, dlg.id);
        } else {
          await addFavourite(currentUser.uid, { ...dlg, movieName });
        }
      } catch (innerErr) {
        // Revert optimistic update on failure
        setFavIds((prev) => {
          const next = new Set(prev);
          if (isFav) next.add(dlg.id);
          else next.delete(dlg.id);
          return next;
        });
        throw innerErr; // re-throw so outer catch handles it
      }
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
      if (err.code === "permission-denied" || err.message?.includes("permissions")) {
        setError("Permission denied. Please make sure Firestore rules allow favourites access.");
      } else {
        setError("Failed to update favourite. Please try again.");
      }
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(dlg.id);
        return next;
      });
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

        {error && (
          <div className="dlg-error">
            ⚠️ {error}
          </div>
        )}

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
                    </div>
                  </div>
                  <button
                    className={`dlg-fav-btn ${favIds.has(dlg.id) ? "dlg-fav-active" : ""} ${togglingIds.has(dlg.id) ? "dlg-fav-loading" : ""}`}
                    onClick={() => handleToggleFav(dlg)}
                    disabled={togglingIds.has(dlg.id)}
                    title={favIds.has(dlg.id) ? "Remove from favourites" : "Add to favourites"}
                    aria-label={favIds.has(dlg.id) ? "Remove from favourites" : "Add to favourites"}
                  >
                    {togglingIds.has(dlg.id) ? "⏳" : favIds.has(dlg.id) ? "★" : "☆"}
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
