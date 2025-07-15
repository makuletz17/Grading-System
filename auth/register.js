import { supabase } from "../supabaseClient.js";

export async function registerUser(data) {
  const { username, email, password, name } = data;

  // Step 1: Check if user already exists
  const { data: existing } = await supabase
    .from("users")
    .select("userId, email, username")
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle();

  if (existing) return "User already exists in database.";

  // Step 2: Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, username },
    },
  });
  if (authError) return authError.message;

  const userId = authData.user?.id;
  if (!userId) return "User ID not found";

  // Step 3: Insert into your custom users table without userId
  const { data: insertedRow, error: insertError } = await supabase
    .from("users")
    .insert([
      {
        name,
        username,
        email,
        level: 2,
        is_hold: 0,
        is_registered: 0,
        date_created: new Date(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    // Optionally: delete the Auth user if you want rollback logic
    await supabase.auth.admin.deleteUser(userId); // Requires service key
    return `Registration failed: ${insertError.message}. Auth user deleted.`;
  }

  // Step 4: Update the row with userId
  const { error: updateError } = await supabase
    .from("users")
    .update({ userId: userId })
    .eq("id", insertedRow.id);

  if (updateError)
    return `User created but failed to update userId: ${updateError.message}`;

  return "Registered successfully!";
}
