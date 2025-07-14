import { supabase } from "../supabaseClient.js";

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return error ? error.message : "Logged in!";
}
