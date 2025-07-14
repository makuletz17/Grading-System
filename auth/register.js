import { supabase } from "../supabaseClient.js";

export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return error ? error.message : "Registered successfully!";
}
