import React, { useState } from "react";
import { useModalsStore, useProfilesStore, useFormStore } from "../store";
import { writeFile } from "../tauri-utils";

const SaveProfileModal = () => {
  const { modals, setModalState } = useModalsStore();
  const handleClose = () => setModalState("saveProfile", false);
  const { profiles, addProfile, updateProfile } = useProfilesStore();
  const formState = useFormStore((state) => state.formState);
  const [mode, setMode] = useState("new");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [error, setError] = useState("");

  const handleSaveProfile = async ({ mode, profile }) => {
    mode === "new" ? addProfile(profile) : updateProfile(profile);
    await writeFile("profiles.json", profiles);
    setModalState("saveProfile", false);
  };

  if (!modals.saveProfile) return null;

  const handleSave = () => {
    if (mode === "new") {
      if (!newProfileName.trim()) {
        setError("Please enter a profile name");
        return;
      }
      if (profiles.some((p) => p.name === newProfileName)) {
        setError("A profile with this name already exists");
        return;
      }
      handleSaveProfile({
        mode: "new",
        profile: {
          ...formState,
          name: newProfileName,
        },
      });
    } else {
      if (!selectedProfile) {
        setError("Please select a profile to overwrite");
        return;
      }
      handleSaveProfile({
        mode: "overwrite",
        profile: {
          ...formState,
          name: selectedProfile.name,
        },
      });
    }
    handleClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save Profile</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="save-mode-buttons">
            <button
              className={`mode-button ${mode === "new" ? "active" : ""}`}
              onClick={() => {
                setMode("new");
                setError("");
              }}
            >
              Create New
            </button>
            <button
              className={`mode-button ${mode === "overwrite" ? "active" : ""}`}
              onClick={() => {
                setMode("overwrite");
                setError("");
              }}
            >
              Overwrite Existing
            </button>
          </div>

          {mode === "new" ? (
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
              {profiles.map((profile, index) => (
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
            <button className="save-button" onClick={handleSave}>
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveProfileModal;
