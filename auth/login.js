import { supabase } from "../supabaseClient.js";

export async function loginUser(email, password) {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return error.message;

  const userId = authData.user?.id;
  if (!userId) return "Logged in, but user ID not found.";

  const { data: userData, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("userId", userId)
    .eq("is_registered", 1)
    .eq("is_hold", 0)
    .single();

  if (profileError) return "Login successful, but profile not found.";

  // Store session info (optional)
  localStorage.setItem("userProfile", JSON.stringify(userData));

  // Redirect to dashboard
  window.location.href = "dashboard.html";

  return `Welcome ${userData.name}!`;
}
