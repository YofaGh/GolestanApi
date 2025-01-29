import { readFile, writeFile, invoke } from "./tauri-utils";
import {
  useReqStore,
  useFormStore,
  useModalsStore,
  useProfilesStore,
} from "./store";

export const XMLInputFormatter = (inputStr) => {
  try {
    return inputStr
      .replace(/"\s*\+\s*"/g, "")
      .replace(/^"|"$/g, "")
      .replace(/\\"/g, '"')
      .replace(/"\s*\+\s*(\w+)\s*\+\s*"/g, "$1")
      .replace(/="\s*\+\s*(\w+)\s*\+\s*"/g, '="$1"')
      .replace(/\\+/g, '"')
      .replace(/></g, ">\n<")
      .split("\n")
      .map((line) => {
        if (line.startsWith("</")) {
          return line;
        }
        if (!line.startsWith("<Root")) {
          return "  " + line;
        }
        return line;
      })
      .join("\n");
  } catch (error) {
    return inputStr;
  }
};

export const XMLResultFormatter = (xmlString) => {
  const match = xmlString.match(/<golInfoResult><Root[^>]*>(.*?)<\/Root>/s);
  if (match) {
    const rows = match[1]
      .replace(/\\"/g, '"')
      .match(/<row[^>]*\/>/g)
      .map((row) => `\t${row}`)
      .join("\n");
    return `<Root xmlns="">\n${rows}\n</Root>`;
  }
  return xmlString;
};

export const handleGetData = async () => {
  const { setResult, setError, setLoading } = useReqStore.getState();
  try {
    setLoading(true);
    setError("");
    const formState = useFormStore.getState().formState;
    const data = await invoke("get_data", { ...formState });
    setResult(JSON.stringify(data, null, 2));
    const button = document.querySelector(".submit-button");
    button.classList.add("success");
    setTimeout(() => button.classList.remove("success"), 2000);
  } catch (err) {
    setError(err.message);
    const button = document.querySelector(".submit-button");
    button.classList.add("error");
    setTimeout(() => button.classList.remove("error"), 2000);
  } finally {
    setLoading(false);
  }
};

export const handleSave = async (
  isNewProfile,
  newProfileName,
  setError,
  selectedProfile
) => {
  const { profiles, addProfile, updateProfile } = useProfilesStore.getState();
  const formState = useFormStore.getState().formState;
  if (isNewProfile) {
    if (!newProfileName) {
      setError("Please enter a profile name");
      return;
    }
    if (profiles.some((p) => p.name === newProfileName)) {
      setError("A profile with this name already exists");
      return;
    }
    addProfile({
      ...formState,
      name: newProfileName,
    });
  } else {
    if (!selectedProfile) {
      setError("Please select a profile to overwrite");
      return;
    }
    updateProfile({
      ...formState,
      name: selectedProfile.name,
    });
  }
  await writeFile("profiles.json", useProfilesStore.getState().profiles);
  useModalsStore.getState().setModalState("saveProfile", false);
};

export const startUp = async () =>
  useProfilesStore.getState().setProfiles(await readFile("profiles.json"));
