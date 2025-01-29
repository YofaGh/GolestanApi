import { useState } from "react";
import { handleSave } from "../utils";
import { useModalsStore, useProfilesStore } from "../store";

const SaveProfileModal = () => {
  const { modals, setModalState } = useModalsStore();
  const [isNewProfile, setIsNewProfile] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [error, setError] = useState("");

  if (!modals.saveProfile) return null;
  return (
    <div
      className="modal-overlay"
      onClick={() => setModalState("saveProfile", false)}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save Profile</h2>
          <button
            className="modal-close"
            onClick={() => setModalState("saveProfile", false)}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="save-mode-buttons">
            <button
              className={`mode-button ${isNewProfile ? "active" : ""}`}
              onClick={() => {
                setIsNewProfile(true);
                setError("");
              }}
            >
              Create New
            </button>
            <button
              className={`mode-button ${isNewProfile ? "active" : ""}`}
              onClick={() => {
                setIsNewProfile(false);
                setError("");
              }}
            >
              Overwrite Existing
            </button>
          </div>
          {isNewProfile ? (
            <div className="input-group">
              <label>
                <span className="label-text">Profile Name</span>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => {
                    setNewProfileName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter profile name"
                  className="profile-name-input"
                />
              </label>
            </div>
          ) : (
            <div className="profile-list">
              {useProfilesStore.getState().profiles.map((profile, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedProfile(profile);
                    setError("");
                  }}
                  className={`profile-select-button ${
                    selectedProfile?.name === profile.name ? "selected" : ""
                  }`}
                >
                  {profile.name}
                </button>
              ))}
            </div>
          )}
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-footer">
            <button
              className="save-button"
              onClick={() =>
                handleSave(
                  isNewProfile,
                  newProfileName.trim(),
                  setError,
                  selectedProfile
                )
              }
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveProfileModal;
