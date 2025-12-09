import { createServerComponentClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    if (!user || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Decode JWT payload
    let jwtPayload: any = null
    if (session.access_token) {
      try {
        jwtPayload = JSON.parse(
          Buffer.from(session.access_token.split('.')[1], 'base64').toString()
        )
      } catch (e) {
        // JWT decode failed
      }
    }

    // Check database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
      },
      jwtPayload,
      roleInJWT: jwtPayload?.role,
      roleInAppMetadata: user.app_metadata?.role,
      roleInUserMetadata: user.user_metadata?.role,
      roleInDatabase: profile?.role,
      sessionExists: !!session,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

