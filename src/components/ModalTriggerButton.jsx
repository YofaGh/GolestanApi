import { useModalsStore } from "../store";

export default function ModalTriggerButton({ modalName, label }) {
  const setModalState = useModalsStore((state) => state.setModalState);
  return (
    <button
      onClick={() => setModalState(modalName, true)}
      className="profile-trigger-button"
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
        className="profile-icon"
      >
        {modalName === "profiles" ? (
          <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </>
        ) : (
          <>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </>
        )}
      </svg>
      {label}
    </button>
  );
}
