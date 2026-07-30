import { create } from "zustand";

export interface AuthSession {
  avatar?: string;
  email: string;
  name?: string;
  session_id: string;
  user_id: string;
}

interface AuthState {
  initAuth: () => Promise<void>;
  isLoaded: boolean;
  logout: () => Promise<void>;
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
}

const STORAGE_KEY = "hyperion_auth_session";

const isTauri = () =>
  typeof window !== "undefined" &&
  ("__TAURI__" in window ||
    "__TAURI_INTERNALS__" in window ||
    "__TAURI_POST_MESSAGE__" in window ||
    process.env.NEXT_PUBLIC_IS_NATIVE === "true");

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoaded: false,

  setSession: (session) => {
    set({ session, isLoaded: true });
    if (typeof window !== "undefined") {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (isTauri()) {
      import("@tauri-apps/api/core")
        .then(({ invoke }) => {
          if (session) {
            invoke("save_session", { session }).catch(console.error);
          } else {
            invoke("clear_session").catch(console.error);
          }
        })
        .catch(() => {});
    }
  },

  logout: async () => {
    set({ session: null, isLoaded: true });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    if (isTauri()) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("clear_session");
      } catch (e) {
        console.error(e);
      }
    }
  },

  initAuth: async () => {
    if (typeof window === "undefined") {
      return;
    }

    let savedSession: AuthSession | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        savedSession = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse saved session", e);
    }

    if (isTauri()) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const tauriSession = await invoke<AuthSession | null>("get_session");
        if (tauriSession) {
          savedSession = tauriSession;
        }
      } catch (e) {
        console.error("Failed to get Tauri session", e);
      }

      try {
        const { listen } = await import("@tauri-apps/api/event");
        await listen<AuthSession>("auth-success", (event) => {
          get().setSession(event.payload);
        });
      } catch (e) {
        console.error("Failed to set up auth event listener", e);
      }
    }

    set({ session: savedSession, isLoaded: true });
  },
}));
