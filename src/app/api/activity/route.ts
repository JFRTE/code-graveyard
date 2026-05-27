import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    // Fallback: just return recent tombstones
    const { data: tombstones } = await supabase
      .from('tombstones')
      .select('id, username, avatar_url, code_name, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    const items = (tombstones || []).map(t => ({
      id: t.id,
      type: 'tombstone',
      user_id: '',
      username: t.username,
      avatar_url: t.avatar_url,
      tombstone_id: t.id,
      tombstone_name: t.code_name,
      created_at: t.created_at,
    }))

    return NextResponse.json({ activities: items })
  }

  return NextResponse.json({ activities: data || [] })
}
