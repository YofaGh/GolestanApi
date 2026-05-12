import { readFile, writeFile, invoke } from "./tauri-utils";
import {
  useReqStore,
  useFormStore,
  useModalsStore,
  useProfilesStore,
  useValidationStore,
} from "./store";

const formatXML = (xml) => {
  let formatted = '';
  let pad = 0;
  xml = xml.replace(/>\s+</g, '><');
  xml = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
  xml.split('\n').forEach((node) => {
    node = node.trim();
    if (!node) return;

    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad > 0) pad -= 1;
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    }
    formatted += '  '.repeat(pad) + node + '\n';
    pad += indent;
  });
  return formatted.trim();
};

export const XMLInputFormatter = (inputStr) => {
  try {
    const cleaned = inputStr
      .replace(/\\n/g, "")
      .replace(/"\s*\+\s*"/g, "")
      .replace(/^"|"$/g, "")
      .replace(/\\"/g, '"')
      .replace(/"\s*\+\s*(\w+)\s*\+\s*"/g, "$1")
      .replace(/="\s*\+\s*(\w+)\s*\+\s*"/g, '="$1"');
    return formatXML(cleaned);
  } catch (error) {
    return inputStr;
  }
};

export const XMLResultFormatter = (xmlString) => {
  try {
    const match = xmlString.match(/<golInfoResult><Root[^>]*>([\s\S]*?)<\/Root>/);
    if (match) {
      const cleaned = match[1].replace(/\\"/g, '"');
      return formatXML(`<Root xmlns="">\n${cleaned}\n</Root>`);
    }
    return formatXML(xmlString);
  } catch (error) {
    return xmlString;
  }
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
      { field: "url", label: "URL", value: formState.url },
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
