import { startUp } from "./utils";
import {
  FormHeader,
  FormResult,
  FormContent,
  ProfileModal,
  SaveProfileModal,
  ModalTriggerButton,
} from "./components";

export default function App() {
  startUp();

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
