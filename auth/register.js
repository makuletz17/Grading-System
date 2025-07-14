import { supabase } from "../supabaseClient.js";

export async function registerUser(email, password, name, level = 1) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return error.message;

  const userId = data.user?.id;
  if (!userId) return "User ID not found";

  // Insert into your table
  const { error: insertError } = await supabase.from("users").insert([
    {
      userId: userId,
      name: name,
      level: level,
      email: email,
      is_hold: 0,
      is_registered: 1,
      date_created: new Date(),
    },
  ]);

  return insertError ? insertError.message : "Registered successfully!";
}
