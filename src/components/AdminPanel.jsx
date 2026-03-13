import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isFirebaseConfigured } from "../firebase";
import { getPendingMovies, approveMovie, deleteMovie } from "../services/movieService";
import { getPendingDialogues, approveDialogue, deleteDialogue } from "../services/dialogueService";
import "./AdminPanel.css";

export default function AdminPanel({ onClose, onContentChanged }) {
  const { currentUser } = useAuth();
  const [pendingMovies, setPendingMovies] = useState([]);
  const [pendingDialogues, setPendingDialogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(null); // track which item is being acted on

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    fetchPending();
  }, []);

  async function fetchPending() {
    setLoading(true);
    try {
      const [movies, dialogues] = await Promise.all([
        getPendingMovies(),
        getPendingDialogues(),
      ]);
      setPendingMovies(movies);
      setPendingDialogues(dialogues);
    } catch (err) {
      console.error("Failed to fetch pending items:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveMovie(movieId) {
    setActionBusy(movieId);
    try {
      await approveMovie(movieId);
      setPendingMovies((prev) => prev.filter((m) => m.id !== movieId));
      if (onContentChanged) onContentChanged();
    } catch (err) {
      console.error("Failed to approve movie:", err);
      alert("Failed to approve. Check permissions.");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleDeleteMovie(movieId) {
    if (!window.confirm("Delete this movie permanently?")) return;
    setActionBusy(movieId);
    try {
      await deleteMovie(movieId);
      setPendingMovies((prev) => prev.filter((m) => m.id !== movieId));
      if (onContentChanged) onContentChanged();
    } catch (err) {
      console.error("Failed to delete movie:", err);
      alert("Failed to delete. Check permissions.");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleApproveDialogue(dialogueId) {
    setActionBusy(dialogueId);
    try {
      await approveDialogue(dialogueId);
      setPendingDialogues((prev) => prev.filter((d) => d.id !== dialogueId));
      if (onContentChanged) onContentChanged();
    } catch (err) {
      console.error("Failed to approve dialogue:", err);
      alert("Failed to approve. Check permissions.");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleDeleteDialogue(dialogueId) {
    if (!window.confirm("Delete this dialogue permanently?")) return;
    setActionBusy(dialogueId);
    try {
      await deleteDialogue(dialogueId);
      setPendingDialogues((prev) => prev.filter((d) => d.id !== dialogueId));
      if (onContentChanged) onContentChanged();
    } catch (err) {
      console.error("Failed to delete dialogue:", err);
      alert("Failed to delete. Check permissions.");
    } finally {
      setActionBusy(null);
    }
  }

  const totalPending = pendingMovies.length + pendingDialogues.length;

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <div>
            <h2>Pending Queue</h2>
            <p className="admin-subtitle">
              {loading ? "Loading…" : `${totalPending} item${totalPending !== 1 ? "s" : ""} awaiting review`}
            </p>
          </div>
          <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {loading ? (
          <div className="admin-loading">Loading pending items…</div>
        ) : totalPending === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty-icon">✅</span>
            <p>All caught up! No pending submissions.</p>
          </div>
        ) : (
          <div className="admin-sections">
            {/* Pending Movies */}
            {pendingMovies.length > 0 && (
              <section className="admin-section">
                <h3 className="admin-section-title">
                  🎬 Pending Movies
                  <span className="admin-badge">{pendingMovies.length}</span>
                </h3>
                <div className="admin-list">
                  {pendingMovies.map((movie) => (
                    <div key={movie.id} className="admin-item">
                      <div className="admin-item-info">
                        {movie.bannerURL && (
                          <img
                            src={movie.bannerURL}
                            alt={movie.movieName}
                            className="admin-thumb"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        )}
                        <div>
                          <strong>{movie.movieName}</strong>
                          <span className="admin-meta">
                            Submitted {movie.createdAt?.toDate?.()
                              ? new Date(movie.createdAt.toDate()).toLocaleDateString()
                              : "recently"}
                          </span>
                        </div>
                      </div>
                      <div className="admin-actions">
                        <button
                          className="admin-approve"
                          onClick={() => handleApproveMovie(movie.id)}
                          disabled={actionBusy === movie.id}
                        >
                          {actionBusy === movie.id ? "…" : "✓ Approve"}
                        </button>
                        <button
                          className="admin-reject"
                          onClick={() => handleDeleteMovie(movie.id)}
                          disabled={actionBusy === movie.id}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pending Dialogues */}
            {pendingDialogues.length > 0 && (
              <section className="admin-section">
                <h3 className="admin-section-title">
                  💬 Pending Dialogues
                  <span className="admin-badge">{pendingDialogues.length}</span>
                </h3>
                <div className="admin-list">
                  {pendingDialogues.map((dlg) => (
                    <div key={dlg.id} className="admin-item">
                      <div className="admin-item-info">
                        <div>
                          <strong>"{dlg.dialogueText}"</strong>
                          <span className="admin-meta">
                            — {dlg.characterName}
                            {dlg.targetCharacter ? ` to ${dlg.targetCharacter}` : ""}
                            {" · "}
                            {dlg.dialogueType}
                          </span>
                        </div>
                      </div>
                      <div className="admin-actions">
                        <button
                          className="admin-approve"
                          onClick={() => handleApproveDialogue(dlg.id)}
                          disabled={actionBusy === dlg.id}
                        >
                          {actionBusy === dlg.id ? "…" : "✓ Approve"}
                        </button>
                        <button
                          className="admin-reject"
                          onClick={() => handleDeleteDialogue(dlg.id)}
                          disabled={actionBusy === dlg.id}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
