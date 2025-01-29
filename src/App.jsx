import { useEffect } from "react";
import { readFile } from "./tauri-utils";
import { useProfilesStore } from "./store";
import {
  FormHeader,
  FormResult,
  FormContent,
  ProfileModal,
  SaveProfileModal,
  ModalTriggerButton,
} from "./components";

export default function App() {
  const { setProfiles } = useProfilesStore();

  useEffect(() => {
    (async () => setProfiles(await readFile("profiles.json")))();
  }, []);

  return (
    <div className="app">
      <div className="profile-button-container">
        <ModalTriggerButton modalName="profiles" label="Select Profile" />
        <ModalTriggerButton modalName="saveProfile" label="Save Profile" />
      </div>
      <ProfileModal />
      <SaveProfileModal />
      <div className="form-container">
        <FormHeader />
        <div className="form-content">
          <FormContent />
          <FormResult />
        </div>
      </div>
    </div>
  );
}
