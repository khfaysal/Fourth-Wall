import Navbar from "./components/Navbar";
import MovieCard from "./components/MovieCard";
import "./App.css";

const mockMovies = [
  {
    id: 1,
    title: "Inception",
    banner:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80",
    category: "Serious",
    dialogueCount: 18,
  },
  {
    id: 2,
    title: "Titanic",
    banner:
      "https://images.unsplash.com/photo-1523760957529-cd03912a8b1a?auto=format&fit=crop&w=800&q=80",
    category: "Romantic",
    dialogueCount: 22,
  },
  {
    id: 3,
    title: "The Dark Knight",
    banner:
      "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?auto=format&fit=crop&w=800&q=80",
    category: "Motivation",
    dialogueCount: 15,
  },
  {
    id: 4,
    title: "Deadpool",
    banner:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
    category: "Funny",
    dialogueCount: 27,
  },
  {
    id: 5,
    title: "Get Out",
    banner:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=800&q=80",
    category: "Horror",
    dialogueCount: 9,
  },
  {
    id: 6,
    title: "Interstellar",
    banner:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    category: "Serious",
    dialogueCount: 19,
  },
];

function App() {
  return (
    <div className="page">
      <Navbar />

      <header className="hero">
        <div>
          <p className="eyebrow">Community-driven movie dialogue hub</p>
          <h1>Curate iconic lines together.</h1>
          <p className="lede">
            Browse memorable quotes, submit your favorites, and let admins keep the
            quality high. Start by searching or exploring popular titles.
          </p>
          <div className="hero-actions">
            <button className="primary">Add a movie</button>
            <button className="ghost">Submit a dialogue</button>
            <button className="ghost">See pending queue</button>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-row">
            <span className="label">Movies</span>
            <strong>24</strong>
          </div>
          <div className="summary-row">
            <span className="label">Dialogues</span>
            <strong>180+</strong>
          </div>
          <div className="summary-row">
            <span className="label">Pending approval</span>
            <strong>6</strong>
          </div>
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
        {mockMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            banner={movie.banner}
            category={movie.category}
            dialogueCount={movie.dialogueCount}
          />
        ))}
      </section>

      <section className="cta">
        <div>
          <h2>Ready to share your favorite line?</h2>
          <p>Sign in with Google to submit a movie or dialogue. Admins will review quickly.</p>
        </div>
        <div className="cta-actions">
          <button className="primary">Log in with Google</button>
          <button className="ghost">See contribution guide</button>
        </div>
      </section>
    </div>
  );
}

export default App;
