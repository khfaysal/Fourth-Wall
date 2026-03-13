import React from "react";
import "../App.css";

const MovieCard = ({ id, movieName, title, bannerURL, banner, category, dialogueCount, onViewDialogues, onAddDialogue }) => {
    const name = movieName || title || "Untitled";
    const image = bannerURL || banner || "";
    const count = dialogueCount ?? 0;

    return (
        <article className="card">
            <div className="card-media">
                {image ? (
                    <img src={image} alt={name} loading="lazy" />
                ) : (
                    <div className="card-placeholder">🎬</div>
                )}
            </div>
            <div className="card-body">
                <div className="card-top">
                    <h3>{name}</h3>
                    <span className="count">{count} dialogues</span>
                </div>
                {category ? <p className="muted">Category: {category}</p> : null}
                <div className="card-actions">
                    <button className="secondary" type="button" onClick={() => onViewDialogues && onViewDialogues(id, name)}>
                        View dialogues
                    </button>
                    <button className="text-btn" type="button" onClick={() => onAddDialogue && onAddDialogue(id)}>
                        Add dialogue →
                    </button>
                </div>
            </div>
        </article>
    );
};

export default MovieCard;
