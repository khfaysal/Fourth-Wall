import React, { useState } from "react";
import { updateDialogue } from "../services/dialogueService";
import "./AuthModals.css";

export default function EditDialogueModal({ dialogue, onClose, onDialogueUpdated }) {
  const [characterName, setCharacterName] = useState(dialogue.characterName || "");
  const [targetCharacter, setTargetCharacter] = useState(dialogue.targetCharacter || "");
  const [dialogueText, setDialogueText] = useState(dialogue.dialogueText || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!characterName.trim()) return setError("Please enter the character name.");
    if (!dialogueText.trim()) return setError("Please enter the dialogue text.");

    setBusy(true);
    try {
      await updateDialogue(dialogue.id, {
        characterName: characterName.trim(),
        targetCharacter: targetCharacter.trim(),
        dialogueText: dialogueText.trim(),
      });
      setSuccess("Dialogue updated successfully!");
      if (onDialogueUpdated) onDialogueUpdated();
      setTimeout(onClose, 1000);
    } catch (err) {
      console.error("Failed to update dialogue:", err);
      setError("Failed to update dialogue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>Edit Dialogue</h2>
        <p className="subtitle">Update the content of this quote</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="edit-dlg-character">Character name</label>
            <input
              id="edit-dlg-character"
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="edit-dlg-target">To character (optional)</label>
            <input
              id="edit-dlg-target"
              type="text"
              value={targetCharacter}
              onChange={(e) => setTargetCharacter(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="edit-dlg-text">Dialogue</label>
            <textarea
              id="edit-dlg-text"
              className="auth-textarea"
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
              rows={3}
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
