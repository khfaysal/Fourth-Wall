import React from "react";
import "./Navbar.css";

const Navbar = () => {
    return (
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
                <a href="#">Log in</a>
                <a href="#">Sign up</a>
                <button className="pro-btn" type="button">Favourite</button>
                <button className="submit-btn" type="button">Practice</button>
            </div>
        </nav>
    );
};

export default Navbar;