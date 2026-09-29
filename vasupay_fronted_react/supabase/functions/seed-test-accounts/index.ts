import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const testAccounts = [
      { email: 'admin@test.com', password: 'admin123', role: 'admin', full_name: 'Test Admin' },
      { email: 'partner@test.com', password: 'partner123', role: 'partner', full_name: 'Test Partner' },
      { email: 'agent@test.com', password: 'agent123', role: 'agent', full_name: 'Test Agent' },
      { email: 'user@test.com', password: 'user123', role: 'user', full_name: 'Test User' },
    ]

    const results = []

    for (const account of testAccounts) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
      const userExists = existingUser?.users.find(u => u.email === account.email)

      if (userExists) {
        // Update role if user exists
        const { data: roleData } = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .eq('user_id', userExists.id)
          .single()

        if (roleData) {
          await supabaseAdmin
            .from('user_roles')
            .update({ role: account.role })
            .eq('user_id', userExists.id)
        } else {
          await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: userExists.id, role: account.role })
        }

        results.push({ email: account.email, status: 'updated', role: account.role })
      } else {
        // Create new user
        const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.full_name
          }
        })

        if (signUpError) {
          results.push({ email: account.email, status: 'error', error: signUpError.message })
          continue
        }

        if (newUser.user) {
          // Assign role
          await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: newUser.user.id, role: account.role })

          results.push({ email: account.email, status: 'created', role: account.role })
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test accounts seeded successfully',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (err) {
    const error = err as Error
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
