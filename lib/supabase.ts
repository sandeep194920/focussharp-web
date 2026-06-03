import { createBrowserClient } from "@supabase/ssr";

export type DbProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
};

export type DbCategory = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: number;
  synced_at: string;
};

export type DbSession = {
  id: string;
  user_id: string;
  cat_id: string;
  cat_name: string;
  cat_color: string;
  duration_mins: number;
  started_at: number;
  completed_at: number;
  completed: boolean;
  type: "focus" | "break";
  synced_at: string;
};

export type DbWaitlist = {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: DbProfile; Insert: Omit<DbProfile, "created_at" | "updated_at">; Update: Partial<DbProfile> };
      categories: { Row: DbCategory; Insert: Omit<DbCategory, "synced_at">; Update: Partial<DbCategory> };
      sessions: { Row: DbSession; Insert: Omit<DbSession, "synced_at">; Update: Partial<DbSession> };
      waitlist: { Row: DbWaitlist; Insert: { email: string; source?: string }; Update: Partial<DbWaitlist> };
    };
  };
};

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowserClient must only be called in the browser");
  }
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }
  return browserClient;
}
