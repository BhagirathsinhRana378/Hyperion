"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@workspace/core/lib/supabase";
import { create } from "zustand";

interface AuthState {
  initialize: () => Promise<void>;
  loading: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
  user: User | null;
}

export const useAuthStore = create<AuthState>()((set) => ({
  loading: true,
  session: null,
  user: null,

  initialize: async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      set({
        loading: false,
        session: data.session,
        user: data.session?.user ?? null,
      });

      supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          set({
            session,
            user: session?.user ?? null,
          });
        }
      );
    } catch (error) {
      console.error("Failed to initialize Supabase auth:", error);
      set({ loading: false, session: null, user: null });
    }
  },

  signOut: async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
