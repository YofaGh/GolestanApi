import { useModalsStore, useProfilesStore, useFormStore } from "../store";

const ProfileModal = () => {
  const { modals, setModalState } = useModalsStore();
  const profiles = useProfilesStore((state) => state.profiles);
  const setFormState = useFormStore((state) => state.setFormState);
  const handleClose = () => setModalState("profiles", false);
  const handleLoad = (profile) => {
    setFormState(profile);
    handleClose();
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
          {profiles.map((profile, index) => (
            <button
              key={index}
              onClick={() => handleLoad(profile)}
              className="profile-select-button"
            >
              {profile.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
