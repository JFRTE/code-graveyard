import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20))
  const userId = searchParams.get('userId')
  const search = searchParams.get('search')
  const cause = searchParams.get('cause')
  const language = searchParams.get('language')
  const sort = searchParams.get('sort') || 'newest'
  const offset = (page - 1) * limit

  let query = supabase.from('tombstones').select('*')

  // Apply filters
  if (userId) query = query.eq('user_id', userId)
  if (search) query = query.or(`code_name.ilike.%${search}%,description.ilike.%${search}%`)
  if (cause) query = query.eq('cause_of_death', cause)
  if (language) query = query.eq('language', language)

  // Sorting
  switch (sort) {
    case 'popular':
      query = query.order('flower_count', { ascending: false })
      break
    case 'eulogies':
      query = query.order('eulogy_count', { ascending: false })
      break
    case 'candles':
      query = query.order('candle_count', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Count with same filters applied
  let countQuery = supabase.from('tombstones').select('*', { count: 'exact', head: true })
  if (userId) countQuery = countQuery.eq('user_id', userId)
  if (search) countQuery = countQuery.or(`code_name.ilike.%${search}%,description.ilike.%${search}%`)
  if (cause) countQuery = countQuery.eq('cause_of_death', cause)
  if (language) countQuery = countQuery.eq('language', language)

  const { count, error: countError } = await countQuery
  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

  const response = NextResponse.json({ tombstones: data, total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) })
  response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
  return response
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  // Rate limit
  const rateLimit = await checkRateLimit(`bury:${session.user.id}`, 5, 300)
  if (!rateLimit.allowed) return NextResponse.json({ error: '操作太频繁，请稍后再试' }, { status: 429 })

  const body = await request.json()
  const { code_name, code_content, language, cause_of_death, birth_date, death_date, description } = body

  if (!code_name || !code_content || !cause_of_death) return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })

  const { data, error } = await supabase.from('tombstones').insert({
    user_id: session.user.id,
    username: session.user.name || 'Anonymous',
    avatar_url: session.user.image || '',
    code_name, code_content,
    language: language || 'unknown',
    cause_of_death,
    birth_date: birth_date || null,
    death_date: death_date || new Date().toISOString().split('T')[0],
    description: description || '',
    flower_count: 0,
    eulogy_count: 0,
    candle_count: 0,
    view_count: 0,
    tags: [],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log activity
  try {
    await supabase.from('activity_log').insert({
    type: 'tombstone',
    user_id: session.user.id,
    username: session.user.name || 'Anonymous',
    avatar_url: session.user.image || '',
    tombstone_id: data.id,
    tombstone_name: code_name,
    })
  } catch (_) {}

  return NextResponse.json(data, { status: 201 })
}
