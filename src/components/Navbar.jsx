import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import FavouritesModal from "./FavouritesModal";
import "./Navbar.css";
import logo from "../assets/logo.png";

const Navbar = ({ onSearch }) => {
  const { currentUser, logout } = useAuth();
  const [modal, setModal] = useState(null); // null | "login" | "signup" | "favourites"

  function openLogin() { setModal("login"); }
  function openSignUp() { setModal("signup"); }
  function closeModal() { setModal(null); }

  function handleFavourites() {
    if (!currentUser) {
      alert("Please log in to see your favourites.");
      openLogin();
      return;
    }
    setModal("favourites");
  }

  function handleSearchChange(e) {
    if (onSearch) onSearch(e.target.value);
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <img src={logo} alt="Fourth Wall Logo" className="logo-img" />
          <h2 className="logo">Fourth Wall</h2>
        </div>

        <div className="nav-center">
          <input
            type="text"
            placeholder="Search by movie or series name"
            className="search"
            aria-label="Search movies"
            onChange={handleSearchChange}
          />
        </div>

        <div className="nav-right">
          <button className="fav-nav-btn" type="button" onClick={handleFavourites}>
            ⭐ Favourites
          </button>

          {currentUser ? (
            <>
              <span className="user-greeting">
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt=""
                    className="user-avatar"
                  />
                )}
                {currentUser.displayName || currentUser.email}
              </span>
              <button className="pro-btn" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="pro-btn" type="button" onClick={openLogin}>
                Login
              </button>
              <button className="submit-btn" type="button" onClick={openSignUp}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Auth modals */}
      {modal === "login" && (
        <LoginModal onClose={closeModal} onSwitchToSignUp={() => setModal("signup")} />
      )}
      {modal === "signup" && (
        <SignUpModal onClose={closeModal} onSwitchToLogin={() => setModal("login")} />
      )}
      {modal === "favourites" && (
        <FavouritesModal onClose={closeModal} />
      )}
    </>
  );
};

export default Navbar;