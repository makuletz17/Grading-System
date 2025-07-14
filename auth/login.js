import { supabase } from "../supabaseClient.js";

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    userId,
    password,
  });
  if (error) return error.message;

  // Fetch student profile
  const { data: userData, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("userId", userId)
    .single();

  if (profileError) return "Login successful, but profile not found.";
  return `Welcome ${userData.name}! You’re in level ${userData.level}.`;
}
