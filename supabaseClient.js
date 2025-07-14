import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://uumekcfgljvheguhecuo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWVrY2ZnbGp2aGVndWhlY3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTY0ODcsImV4cCI6MjA2Nzk5MjQ4N30.LCM-oM5kf8z_zPpIRc8EVALfCLb12jZFUpejXWwCa8k"
);
