import { supabase } from "../supabaseClient.js";

export async function loginUser(email, password) {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { status: "error", message: error.message };

  const userId = authData.user?.id;
  if (!userId) return { status: "error", message: "Please try again later." };

  const { data: userData, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("userId", userId)
    .eq("is_registered", 1)
    .eq("is_hold", 0)
    .single();

  if (profileError)
    return {
      status: "error",
      message: "Please wait for confirmation of your account.",
    };

  // Store session info (optional)
  localStorage.setItem("userProfile", JSON.stringify(userData));

  return { status: "success", data: userData.name };
}
