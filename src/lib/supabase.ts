import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://prwqgbhrypdwcunpezkq.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd3FnYmhyeXBkd2N1bnBlemtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjg5NDAsImV4cCI6MjEwNDc0NDk0MH0.kxU0-3UCvOhXQWEfrPmkH4ktMLlr-cewOS_qyXB_tts";

export const supabaseEnabled = Boolean(url && key);

export const supabase = supabaseEnabled
  ? createClient(url, key)
  : null;