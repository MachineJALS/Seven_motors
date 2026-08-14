import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null | undefined; // undefined = still checking
}

export const AuthContext = createContext<AuthState>({ session: undefined });
