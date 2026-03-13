import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [modal, setModal] = useState(null); // null | "login" | "signup"

  function openLogin() { setModal("login"); }
  function openSignUp() { setModal("signup"); }
  function closeModal() { setModal(null); }

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo">FW</h2>
        </div>

        <div className="nav-center">
          <input
            type="text"
            placeholder="Search by movie or dialogue"
            className="search"
            aria-label="Search movies or dialogues"
          />
        </div>

        <div className="nav-right">
          <button className="pro-btn" type="button">Favourite</button>
          <button className="submit-btn" type="button">Practice</button>

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
    </>
  );
};

export default Navbar;