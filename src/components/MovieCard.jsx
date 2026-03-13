import React from "react";
import "../App.css";

// MovieCard: reusable card for listing movies with actions.
const MovieCard = ({ title, banner, category, dialogueCount }) => {
    return (
        <article className="card">
            <div className="card-media">
                <img src={banner} alt={title} loading="lazy" />
            </div>
            <div className="card-body">
                <div className="card-top">
                    <h3>{title}</h3>
                    <span className="count">{dialogueCount} dialogues</span>
                </div>
                {category ? <p className="muted">Category: {category}</p> : null}
                <div className="card-actions">
                    <button className="secondary" type="button">View dialogues</button>
                    <button className="text-btn" type="button">Add dialogue →</button>
                </div>
            </div>
        </article>
    );
};

export default MovieCard;
