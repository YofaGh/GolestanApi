import { writeFile } from "../tauri-utils";
import { useModalsStore, useProfilesStore, useFormStore } from "../store";

const ProfileModal = () => {
  const { modals, setModalState } = useModalsStore();
  const { profiles, deleteProfile } = useProfilesStore();
  const setFormState = useFormStore((state) => state.setFormState);

  const handleClose = () => setModalState("profiles", false);

  const handleLoad = (profile) => {
    setFormState(profile);
    handleClose();
  };

  const handleDelete = (profile) => {
    deleteProfile(profile);
    writeFile("profiles.json", useProfilesStore.getState().profiles);
  };

  if (!modals.profiles) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Profile</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {profiles.map((profile) => (
            <div key={profile.name} className="profile-item">
              <button
                onClick={() => handleLoad(profile)}
                className="profile-select-button"
              >
                {profile.name}
              </button>
              <button
                onClick={() => handleDelete(profile)}
                className="profile-delete-button"
                title="Delete profile"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
