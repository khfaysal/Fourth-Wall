import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MovieCard from "./components/MovieCard";
import AddMovieModal from "./components/AddMovieModal";
import AddDialogueModal from "./components/AddDialogueModal";
import ViewDialoguesModal from "./components/ViewDialoguesModal";
import AdminPanel from "./components/AdminPanel";
import { useAuth } from "./contexts/AuthContext";
import { isFirebaseConfigured } from "./firebase";
import { getApprovedMovies, getApprovedMovieCount, getPendingMovieCount } from "./services/movieService";
import { getTotalDialogueCount, getDialogueCountForMovie } from "./services/dialogueService";
import "./App.css";

function App() {
  const { currentUser, signInWithGoogle } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [stats, setStats] = useState({ movies: "—", dialogues: "—", pending: "—" });
  const [searchQuery, setSearchQuery] = useState("");

  // Admin access check
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = currentUser && adminEmails.includes(currentUser.email?.toLowerCase());
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showAddDialogue, setShowAddDialogue] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [viewingMovie, setViewingMovie] = useState(null); // { id, name }
  const [dialogueMovieId, setDialogueMovieId] = useState(""); // pre-selected movie for AddDialogueModal

  // Fetch approved movies from Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [movieList, movieCount, dialogueCount, pendingCount] = await Promise.all([
        getApprovedMovies(),
        getApprovedMovieCount(),
        getTotalDialogueCount(),
        isAdmin ? getPendingMovieCount() : Promise.resolve(0),
      ]);

      // Enrich each movie with its individual dialogue count
      const enriched = await Promise.all(
        movieList.map(async (movie) => {
          try {
            const count = await getDialogueCountForMovie(movie.id);
            return { ...movie, dialogueCount: count };
          } catch {
            return { ...movie, dialogueCount: 0 };
          }
        })
      );

      setMovies(enriched);
      setStats({
        movies: movieCount,
        dialogues: dialogueCount > 0 ? `${dialogueCount}` : "0",
        pending: pendingCount,
      });
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  }

  function handleAddMovie() {
    if (!currentUser) {
      alert("Please log in first to add a movie.");
      return;
    }
    setShowAddMovie(true);
  }

  function handleAddDialogue(preselectedId) {
    if (!currentUser) {
      alert("Please log in first to submit a dialogue.");
      return;
    }
    setDialogueMovieId(preselectedId || "");
    setShowAddDialogue(true);
  }

  function handleViewDialogues(movieId, movieName) {
    setViewingMovie({ id: movieId, name: movieName });
  }

  // Client-side search filter by movie name
  const filteredMovies = searchQuery.trim()
    ? movies.filter((m) =>
        (m.movieName || "").toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : movies;

  return (
    <div className="page">
      <Navbar onSearch={setSearchQuery} />

      <header className="hero">
        <div>
          <p className="eyebrow">Community-driven movie dialogue hub</p>
          <h1>Curate iconic lines together.</h1>
          <p className="lede">
            Browse memorable quotes, submit your favorites, and let admins keep the
            quality high. Start by searching or exploring popular titles.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={handleAddMovie}>Add a movie</button>
            <button className="ghost" onClick={handleAddDialogue}>Submit a dialogue</button>
            {isAdmin && (
              <button className="ghost" onClick={() => setShowAdmin(true)}>See pending queue</button>
            )}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-row">
            <span className="label">Movies</span>
            <strong>{stats.movies}</strong>
          </div>
          <div className="summary-row">
            <span className="label">Dialogues</span>
            <strong>{stats.dialogues}</strong>
          </div>
          {isAdmin && (
            <div className="summary-row">
              <span className="label">Pending approval</span>
              <strong>{stats.pending}</strong>
            </div>
          )}
        </div>
      </header>

      <section className="filters">
        <span className="pill active">All</span>
        <span className="pill">Romantic</span>
        <span className="pill">Serious</span>
        <span className="pill">Funny</span>
        <span className="pill">Motivation</span>
      </section>

      <section className="grid">
        {loading ? (
          <p className="loading-text">Loading movies…</p>
        ) : filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              movieName={movie.movieName}
              bannerURL={movie.bannerURL}
              category={movie.category}
              dialogueCount={movie.dialogueCount}
              onViewDialogues={handleViewDialogues}
              onAddDialogue={(movieId) => handleAddDialogue(movieId)}
            />
          ))
        ) : searchQuery.trim() ? (
          <p className="empty-text">
            No movies match "{searchQuery}". Try a different search.
          </p>
        ) : (
          <p className="empty-text">
            No movies yet. Be the first to add one!
          </p>
        )}
      </section>

      <section className="cta">
        <div>
          <h2>Ready to share your favorite line?</h2>
          <p>Sign in with Google to submit a movie or dialogue. Admins will review quickly.</p>
        </div>
        <div className="cta-actions">
          {currentUser ? (
            <button className="primary" disabled>You're signed in ✓</button>
          ) : (
            <button className="primary" onClick={handleGoogleLogin}>Log in with Google</button>
          )}
          <button className="ghost">See contribution guide</button>
        </div>
      </section>

      {/* Modals */}
      {showAddMovie && (
        <AddMovieModal
          onClose={() => setShowAddMovie(false)}
          onMovieAdded={() => fetchData()}
        />
      )}
      {showAddDialogue && (
        <AddDialogueModal
          onClose={() => { setShowAddDialogue(false); setDialogueMovieId(""); }}
          onDialogueAdded={() => fetchData()}
          preselectedMovieId={dialogueMovieId}
        />
      )}
      {viewingMovie && (
        <ViewDialoguesModal
          movieId={viewingMovie.id}
          movieName={viewingMovie.name}
          onClose={() => setViewingMovie(null)}
          onAddDialogue={() => {
            setViewingMovie(null);
            handleAddDialogue(viewingMovie.id);
          }}
        />
      )}
      {showAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onContentChanged={() => fetchData()}
        />
      )}
    </div>
  );
}

export default App;
