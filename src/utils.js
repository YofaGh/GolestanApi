import { readFile, writeFile, invoke } from "./tauri-utils";
import {
  useReqStore,
  useFormStore,
  useModalsStore,
  useProfilesStore,
  useValidationStore,
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
  try {
    const match = xmlString.match(
      /<golInfoResult><Root[^>]*>([\s\S]*?)<\/Root>/
    );
    if (match) {
      let nodes = match[1]
        .replace(/\\"/g, '"')
        .match(/<(\w+)([^>]*)>([^<]*)<\/\1>|<(\w+)([^>]*)\/>/g);
      if (nodes) {
        let formattedNodes = nodes.map((node) => `\t${node}`).join("\n");
        return `<Root xmlns="">\n${formattedNodes}\n</Root>`;
      }
    }
  } catch (error) {}
  return xmlString;
};

const scrollToResults = () => {
  setTimeout(() => {
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, 100);
};

export const handleGetData = async () => {
  const { setResult, setError, setLoading } = useReqStore.getState();
  const { setInvalidFields, setValidationError, clearValidation } =
    useValidationStore.getState();

  try {
    clearValidation();

    const formState = useFormStore.getState().formState;
    
    const requiredFields = [
      { field: "userName", label: "User Name", value: formState.userName },
      { field: "password", label: "Password", value: formState.password },
      { field: "reportId", label: "Report ID", value: formState.reportId },
      {
        field: "secretCode",
        label: "Secret Code",
        value: formState.secretCode,
      },
    ];

    const emptyFields = requiredFields.filter((field) => !field.value.trim());

    if (emptyFields.length > 0) {
      const invalidFieldNames = emptyFields.map((field) => field.field);
      const fieldLabels = emptyFields.map((field) => field.label);

      setInvalidFields(invalidFieldNames);

      if (emptyFields.length === 1) {
        setValidationError(`Please fill in the ${fieldLabels[0]} field.`);
      } else if (emptyFields.length === 2) {
        setValidationError(
          `Please fill in the ${fieldLabels[0]} and ${fieldLabels[1]} fields.`
        );
      } else {
        const lastField = fieldLabels.pop();
        setValidationError(
          `Please fill in the ${fieldLabels.join(
            ", "
          )}, and ${lastField} fields.`
        );
      }

      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    scrollToResults();

    const data = await invoke("get_data", { ...formState });
    setResult(JSON.stringify(data, null, 2));
  } catch (err) {
    setError(err.message);
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
