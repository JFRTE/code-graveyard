import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabase()

  // Get all tombstones for stats
  const { data: tombstones, error } = await supabase
    .from('tombstones')
    .select('cause_of_death, language, flower_count, eulogy_count, candle_count, created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const all = tombstones || []
  const total = all.length

  // Cause distribution
  const causeCounts: Record<string, number> = {}
  const langCounts: Record<string, number> = {}
  let totalFlowers = 0
  let totalEulogies = 0
  let totalCandles = 0

  all.forEach(t => {
    causeCounts[t.cause_of_death] = (causeCounts[t.cause_of_death] || 0) + 1
    langCounts[t.language] = (langCounts[t.language] || 0) + 1
    totalFlowers += t.flower_count || 0
    totalEulogies += t.eulogy_count || 0
    totalCandles += t.candle_count || 0
  })

  const topCauses = Object.entries(causeCounts)
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)

  const topLanguages = Object.entries(langCounts)
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count)

  // Monthly trend (last 12 months)
  const now = new Date()
  const monthly: { month: string; count: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const count = all.filter(t => (t.created_at || '').substring(0, 7) === monthKey).length
    monthly.push({ month: `${d.getMonth() + 1}月`, count })
  }

  const response = NextResponse.json({
    total,
    totalFlowers,
    totalEulogies,
    totalCandles,
    topCauses,
    topLanguages,
    monthly,
  })
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  return response
}
