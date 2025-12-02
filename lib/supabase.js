const { createClient } = require('@supabase/supabase-js');

console.log('Supabase URL:', process.env.SUPABASE_URL)

module.exports = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);
