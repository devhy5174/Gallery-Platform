import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** .env에 값이 채워졌는지 여부 — false면 Supabase 호출 불가 */
export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseAnonKey;
