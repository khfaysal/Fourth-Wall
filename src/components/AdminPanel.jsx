import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isFirebaseConfigured } from "../firebase";
import { getPendingMovies, getApprovedMovies, approveMovie, deleteMovie } from "../services/movieService";
import { getPendingDialogues, getAllApprovedDialogues, approveDialogue, deleteDialogue } from "../services/dialogueService";
import EditMovieModal from "./EditMovieModal";
import EditDialogueModal from "./EditDialogueModal";
import "./AdminPanel.css";

export default function AdminPanel({ mode = "pending", onClose, onContentChanged }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(mode === "pending" ? "pending-movie" : "movie");
  const [pendingMovies, setPendingMovies] = useState([]);
  const [pendingDialogues, setPendingDialogues] = useState([]);
  const [approvedMovies, setApprovedMovies] = useState([]);
  const [approvedDialogues, setApprovedDialogues] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(null); 
  
  const [editingMovie, setEditingMovie] = useState(null);
  const [editingDialogue, setEditingDialogue] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    if (mode === "pending") {
      fetchPending();
    } else {
      if (activeTab === "movie") fetchApprovedMovies();
      else if (activeTab === "dialogue") fetchApprovedDialogues();
    }
  }, [activeTab, mode]);

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

  async function fetchApprovedMovies() {
    setLoading(true);
    try {
      setApprovedMovies(await getApprovedMovies());
    } catch (err) {
      console.error("Failed to fetch approved movies:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchApprovedDialogues() {
    setLoading(true);
    try {
      setApprovedDialogues(await getAllApprovedDialogues());
    } catch (err) {
      console.error("Failed to fetch approved dialogues:", err);
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

  async function handleDeleteMovie(movieId, isApprovedList = false) {
    if (!window.confirm("Delete this movie permanently?")) return;
    setActionBusy(movieId);
    try {
      await deleteMovie(movieId);
      if (isApprovedList) {
        setApprovedMovies((prev) => prev.filter((m) => m.id !== movieId));
      } else {
        setPendingMovies((prev) => prev.filter((m) => m.id !== movieId));
      }
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

  async function handleDeleteDialogue(dialogueId, isApprovedList = false) {
    if (!window.confirm("Delete this dialogue permanently?")) return;
    setActionBusy(dialogueId);
    try {
      await deleteDialogue(dialogueId);
      if (isApprovedList) {
        setApprovedDialogues((prev) => prev.filter((d) => d.id !== dialogueId));
      } else {
        setPendingDialogues((prev) => prev.filter((d) => d.id !== dialogueId));
      }
      if (onContentChanged) onContentChanged();
    } catch (err) {
      console.error("Failed to delete dialogue:", err);
      alert("Failed to delete. Check permissions.");
    } finally {
      setActionBusy(null);
    }
  }

  return (
    <>
      <div className="admin-overlay" onClick={onClose}>
        <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
          <div className="admin-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
            <div>
              <h2>{mode === "pending" ? "Pending Queue" : "Edit Content"}</h2>
              <p className="admin-subtitle">
                {mode === "pending" 
                  ? "Review and approve movie and dialogue submissions."
                  : "Modify or delete approved movies and dialogues."}
              </p>
            </div>
            <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className="admin-tabs" style={{ display: 'flex', borderBottom: '1px solid #333', margin: '0 24px 24px', gap: '16px' }}>
            {mode === "pending" ? (
              <>
                <button 
                  style={{ background: 'none', border: 'none', color: activeTab === 'pending-movie' ? 'var(--primary)' : '#aaa', padding: '12px 0', borderBottom: activeTab === 'pending-movie' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setActiveTab('pending-movie')}
                >
                  Movie ({pendingMovies.length})
                </button>
                <button 
                  style={{ background: 'none', border: 'none', color: activeTab === 'pending-dialogue' ? 'var(--primary)' : '#aaa', padding: '12px 0', borderBottom: activeTab === 'pending-dialogue' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setActiveTab('pending-dialogue')}
                >
                  Dialogue ({pendingDialogues.length})
                </button>
              </>
            ) : (
              <>
                <button 
                  style={{ background: 'none', border: 'none', color: activeTab === 'movie' ? 'var(--primary)' : '#aaa', padding: '12px 0', borderBottom: activeTab === 'movie' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setActiveTab('movie')}
                >
                  Movie
                </button>
                <button 
                  style={{ background: 'none', border: 'none', color: activeTab === 'dialogue' ? 'var(--primary)' : '#aaa', padding: '12px 0', borderBottom: activeTab === 'dialogue' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setActiveTab('dialogue')}
                >
                  Dialogue
                </button>
              </>
            )}
          </div>

          <div className="admin-content" style={{ flex: 1, overflowY: 'auto' }}>
            {mode === "pending" && activeTab === "pending-movie" && (
              loading ? (
                <div className="admin-loading">Loading pending movies…</div>
              ) : pendingMovies.length === 0 ? (
                <div className="admin-empty">
                  <span className="admin-empty-icon">🎬</span>
                  <p>No pending movie submissions.</p>
                </div>
              ) : (
                <div className="admin-sections">
                  <section className="admin-section">
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
                              onClick={() => handleDeleteMovie(movie.id, false)}
                              disabled={actionBusy === movie.id}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )
            )}

            {mode === "pending" && activeTab === "pending-dialogue" && (
              loading ? (
                <div className="admin-loading">Loading pending dialogues…</div>
              ) : pendingDialogues.length === 0 ? (
                <div className="admin-empty">
                  <span className="admin-empty-icon">💬</span>
                  <p>No pending dialogue submissions.</p>
                </div>
              ) : (
                <div className="admin-sections">
                  <section className="admin-section">
                    <div className="admin-list">
                      {pendingDialogues.map((dlg) => (
                        <div key={dlg.id} className="admin-item">
                          <div className="admin-item-info">
                            <div>
                              <strong>"{dlg.dialogueText}"</strong>
                              <span className="admin-meta">
                                — {dlg.characterName}
                                {dlg.targetCharacter ? ` to ${dlg.targetCharacter}` : ""}
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
                              onClick={() => handleDeleteDialogue(dlg.id, false)}
                              disabled={actionBusy === dlg.id}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )
            )}

            {mode === "edit" && activeTab === "movie" && (
              loading ? (
                <div className="admin-loading">Loading movies…</div>
              ) : approvedMovies.length === 0 ? (
                <div className="admin-empty">
                  <p>No approved movies found.</p>
                </div>
              ) : (
                <div className="admin-sections">
                  <section className="admin-section">
                    <div className="admin-list">
                      {approvedMovies.map((movie) => (
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
                            </div>
                          </div>
                          <div className="admin-actions">
                            <button
                              className="admin-approve"
                              onClick={() => setEditingMovie(movie)}
                              disabled={actionBusy === movie.id}
                              style={{ background: "#444", color: "#fff", border: "1px solid #555" }}
                            >
                              ✎ Edit
                            </button>
                            <button
                              className="admin-reject"
                              onClick={() => handleDeleteMovie(movie.id, true)}
                              disabled={actionBusy === movie.id}
                            >
                              ✕ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )
            )}

            {mode === "edit" && activeTab === "dialogue" && (
              loading ? (
                <div className="admin-loading">Loading dialogues…</div>
              ) : approvedDialogues.length === 0 ? (
                <div className="admin-empty">
                  <p>No approved dialogues found.</p>
                </div>
              ) : (
                <div className="admin-sections">
                  <section className="admin-section">
                    <div className="admin-list">
                      {approvedDialogues.map((dlg) => (
                        <div key={dlg.id} className="admin-item">
                          <div className="admin-item-info">
                            <div>
                              <strong>"{dlg.dialogueText}"</strong>
                              <span className="admin-meta">
                                — {dlg.characterName}
                                {dlg.targetCharacter ? ` to ${dlg.targetCharacter}` : ""}
                              </span>
                            </div>
                          </div>
                          <div className="admin-actions">
                            <button
                              className="admin-approve"
                              onClick={() => setEditingDialogue(dlg)}
                              disabled={actionBusy === dlg.id}
                              style={{ background: "#444", color: "#fff", border: "1px solid #555" }}
                            >
                              ✎ Edit
                            </button>
                            <button
                              className="admin-reject"
                              onClick={() => handleDeleteDialogue(dlg.id, true)}
                              disabled={actionBusy === dlg.id}
                            >
                              ✕ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {editingMovie && (
        <EditMovieModal
          movie={editingMovie}
          onClose={() => setEditingMovie(null)}
          onMovieUpdated={() => {
            fetchApprovedMovies();
            if (onContentChanged) onContentChanged();
          }}
        />
      )}

      {editingDialogue && (
        <EditDialogueModal
          dialogue={editingDialogue}
          onClose={() => setEditingDialogue(null)}
          onDialogueUpdated={() => {
            fetchApprovedDialogues();
            if (onContentChanged) onContentChanged();
          }}
        />
      )}
    </>
  );
}
