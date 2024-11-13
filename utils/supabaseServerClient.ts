import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase URL and Anon Key must be defined");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);