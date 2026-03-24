import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { normalizeEmail } from '@/lib/utils/email'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const cookieStore = cookies()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        const supabase = createRouteHandlerClient({ cookies: () => cookieStore }, {
            supabaseUrl,
            supabaseKey: supabaseAnonKey,
        } as any)
        await supabase.auth.exchangeCodeForSession(code)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const normalizedEmail = normalizeEmail(user.email!)
            const type = requestUrl.searchParams.get('type')

            // 1. Check if another user already has this normalized email
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', normalizedEmail)
                .neq('id', user.id)
                .maybeSingle()

            if (existingUser) {
                await supabase.auth.signOut()
                return NextResponse.redirect(new URL('/login?error=email_exists', request.url))
            }

            // 2. Ensure public.users has the normalized version
            // (The trigger might have already inserted the un-normalized one)
            await supabase
                .from('users')
                .update({ email: normalizedEmail })
                .eq('id', user.id)

            if (type === 'signup') {
                const createdAt = new Date(user.created_at).getTime()
                const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : createdAt

                if (lastSignInAt - createdAt > 10000) { // 10 seconds difference (existing user)
                    await supabase.auth.signOut()
                    return NextResponse.redirect(new URL('/signup?error=email_exists', request.url))
                }
            }
        }
    }

    // URL to redirect to after sign in process completes
    const next = requestUrl.searchParams.get('next') || '/dashboard'
    return NextResponse.redirect(new URL(next, request.url))
}
