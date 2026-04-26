const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing from environment variables.");
  throw new Error("Supabase credentials are missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
