import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Get single tombstone
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('tombstones')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '墓碑不存在' }, { status: 404 })
  }
  return NextResponse.json(data)
}

// Update tombstone
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const supabase = getSupabase()

  // Check ownership
  const { data: existing } = await supabase
    .from('tombstones')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!existing || existing.user_id !== session.user.id) {
    return NextResponse.json({ error: '无权编辑' }, { status: 403 })
  }

  const body = await request.json()
  const { code_name, code_content, language, cause_of_death, birth_date, death_date, description } = body

  const { data, error } = await supabase
    .from('tombstones')
    .update({
      code_name,
      code_content,
      language,
      cause_of_death,
      birth_date: birth_date || null,
      death_date,
      description: description || '',
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Delete tombstone
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const supabase = getSupabase()

  // Check ownership
  const { data: existing } = await supabase
    .from('tombstones')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!existing || existing.user_id !== session.user.id) {
    return NextResponse.json({ error: '无权删除' }, { status: 403 })
  }

  const { error } = await supabase
    .from('tombstones')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
