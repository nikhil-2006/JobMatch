import { createClient } from '@supabase/supabase-js'

/**
 * Server-side admin client — uses the service role key to bypass RLS.
 * NEVER expose this client or key to the browser.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
