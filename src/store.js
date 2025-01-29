import { create } from "zustand";

export const useProfilesStore = create((set) => ({
  profiles: [],

  setProfiles: (newProfiles) => set({ profiles: newProfiles }),
  addProfile: (profile) =>
    set((state) => ({
      profiles: [...state.profiles, profile],
    })),
  updateProfile: (profile) =>
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.name === profile.name ? profile : p
      ),
    })),
  deleteProfile: (profile) =>
    set((state) => ({
      profiles: state.profiles.filter((p) => p.name !== profile.name),
    })),
}));

export const useModalsStore = create((set) => ({
  modals: {
    profiles: false,
    saveProfile: false,
  },
  setModalState: (modalName, isOpen) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: isOpen,
      },
    })),
}));

export const useFormStore = create((set) => ({
  formState: {
    userName: "",
    password: "",
    reportId: "",
    secretCode: "",
    publicFilter: "",
    privateFilter: "",
    url: "http://golestan._.ac.ir/golestanservice/gservice.asmx",
  },

  setFormState: (newState) =>
    set((state) => ({
      formState: {
        ...state.formState,
        ...newState,
      },
    })),

  updateField: (fieldName, value) =>
    set((state) => ({
      formState: {
        ...state.formState,
        [fieldName]: value,
      },
    })),
}));

export const useActiveFieldStore = create((set) => ({
  activeField: null,

  setActiveField: (fieldName) => set({ activeField: fieldName }),
  deactiveField: () => set({ activeField: null }),
}));

export const useReqStore = create((set) => ({
  result: "",
  error: "",

  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),
}));
