import React from "react";
import "./ContributionGuideModal.css";

export default function ContributionGuideModal({ onClose }) {
  return (
    <div className="guide-overlay" onClick={onClose}>
      <div className="guide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="guide-header">
          <div>
            <h2>Contribution Guide</h2>
            <p className="guide-subtitle">How to help curate Fourth Wall</p>
          </div>
          <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="guide-body">
          <div className="guide-step">
            <div className="guide-step-number">1</div>
            <div className="guide-step-content">
              <h3>Add a Movie</h3>
              <p>
                Click the <strong>"Add a movie"</strong> button to add a new title by entering its name and optionally providing a banner link.
              </p>
              <p>
                After submitting, the movie will be added to the pending queue. It will appear on the website only after being reviewed and approved by an admin.
              </p>
            </div>
          </div>

          <div className="guide-step">
            <div className="guide-step-number">2</div>
            <div className="guide-step-content">
              <h3>Submit a Dialogue</h3>
              <p>
                Use the <strong>"Submit a dialogue"</strong> button (or click <strong>"Add dialogue"</strong> on an existing movie card) to share an iconic quote.
              </p>
              <p>
                Select the movie from the dropdown, enter the speaking character's name, and the person receiving the dialogue. Finally, type the quote. Like movies, submissions are reviewed by an admin before being published.
              </p>
            </div>
          </div>

          <div className="guide-note">
            <span className="guide-note-icon">✨</span>
            <p><strong>Note:</strong> You must log in with your Google account to add a movie or submit a dialogue.</p>
          </div>
        </div>

        <div className="guide-footer">
          <button className="guide-confirm-btn" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
