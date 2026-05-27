import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// AI-style eulogy templates based on cause of death
const EULOGY_TEMPLATES: Record<string, string[]> = {
  refactored: [
    '安息吧，{name}。你是重构路上的先驱者，用生命换来了更优雅的代码结构。你的牺牲不是白费的——至少新代码的圈复杂度降低了 3 点。',
    '{name}，你曾是系统中最忠诚的函数。当重构的风暴来临时，你没有逃跑，而是静静地等待被替换。愿你在代码天堂里不再有技术债。',
    '致 {name}：你是被重构献祭的羔羊。有人说你的实现太笨重，但我知道你只是在用最朴素的方式完成使命。Rest in spaghetti, forever unforgettih 🍝',
  ],
  deleted_by_mistake: [
    '我们聚集在此，悼念 {name}。它不是被杀死的，而是被一次手滑的 `git checkout` 带走的。愿天堂没有 rm -rf。',
    '安息吧 {name}。删除你的那一刻，我的手指比我的大脑快了 0.3 秒。Ctrl+Z 按了一万遍也没能挽回你。',
    '{name} 于今日因误删离世。有人说它会在回收站里安息，但 SSD 用户知道——它已经去了更好的地方。',
  ],
  project_abandoned: [
    '致 {name}：你死于项目被弃。老板说"先放一放"，这一放就是永远。你不是第一个，也不会是最后一个。',
    '安息吧 {name}。你所在的项目从"下个季度上线"变成了"明年再说"，最后变成了"那个项目还在维护吗？"。你的故事，我们都懂。',
    '{name}，你是被遗忘在 GitHub 仓库深处的灵魂。最后一次 commit 停留在 2023 年，再没有人来唤醒你。',
  ],
  client_requirements: [
    '今天，我们送别 {name}。甲方说"我要五彩斑斓的黑"，然后你就像彩虹一样消失了。需求变更，代码陪葬。',
    '安息吧 {name}。你是甲方法力下的牺牲品。产品经理说"这个很简单吧"，然后你的一百行代码变成了零行。',
    '{name} 死于需求变更。第 1 版完美运行，第 7 版已经面目全非，第 12 版被整个删除。需求如风，常伴吾身。',
  ],
  tech_obsolete: [
    '致 {name}：你曾是框架界的明星，直到下一个大版本发布。技术更新的速度比你运行的速度还快。安息吧。',
    '{name} 于今日因技术过时离世。jQuery 时代的遗老们，举杯致敬。你的精神将永远活在 legacy code 里。',
    '安息吧 {name}。当"现代化重构"的号角吹响时，你安静地退出了历史舞台。但别忘了——没有你，就没有今天的系统。',
  ],
  mystery_bug: [
    '我们至今不知道 {name} 是怎么死的。它在测试环境运行完美，在生产环境却莫名其妙挂了。这就是玄学。',
    '{name} 死因不明。日志显示一切正常，但代码就是不工作。三个程序员花了两天也没找到 bug。它去了一个 Stack Overflow 也回答不了的地方。',
    '致 {name}：你的死因是一个永远解不开的谜。有人说是指针问题，有人说是时序问题，但我们都同意——这是玄学。',
  ],
  rewritten: [
    '安息吧 {name}。"推倒重来"是程序员最大的浪漫，也是最残酷的告别。你是旧世界的丰碑，新世界的基石。',
    '{name} 被重写了。"这次一定写好"的誓言还在耳边回响，但我们都知道，下一个版本也会被重写。循环往复，生生不息。',
    '致 {name}：你死于"我看不上这段代码"综合征。程序员的通病——昨天写的代码今天就看不顺眼。你是最新的受害者。',
  ],
  other: [
    '安息吧 {name}。虽然没人记得你为什么被删除，但我们知道你曾经存在过。这就够了。',
    '{name}，死因不详，生平不详。但今天，你在这里被纪念，被铭记。每一个被删除的代码片段，都值得一个体面的告别。',
    '致 {name}：你以一种无人知晓的方式离开了我们。但请放心，你的故事将在这里永远流传。',
  ],
}

// Language-specific endings
const LANG_ENDINGS: Record<string, string> = {
  javascript: '愿你安息在 node_modules 的深处，永不再被 require。🪦',
  typescript: '愿你在天堂找到完美的类型定义，再也不会 any。✨',
  python: '愿你在天堂享受无限的缩进空间，永不受 IndentationError 之苦。🐍',
  java: '愿你在天堂不需要写那么多 boilerplate，获得真正的自由。☕',
  go: '愿你在天堂不需要处理那么多 error，终于可以 panic in peace。🏃',
  rust: '愿你在天堂不需要跟 borrow checker 斗争，拥有无限的所有权。🦀',
  php: '愿你在天堂不用再被嘲笑，你其实一直都很努力。🐘',
  ruby: '愿你在天堂继续享受优雅的语法，永远 on rails。💎',
  c: '愿你在天堂没有段错误，没有内存泄漏。一切都是 0 和 1 的和谐。⚡',
  cpp: '愿你在天堂不需要管理内存，智能指针自动清理一切。🔧',
}

function generateEulogy(codeName: string, cause: string, language: string): string {
  const templates = EULOGY_TEMPLATES[cause] || EULOGY_TEMPLATES['other']
  const template = templates[Math.floor(Math.random() * templates.length)]
  const eulogy = template.replace(/\{name\}/g, codeName)

  const ending = LANG_ENDINGS[language] || '愿你安息，在数字的世界里永远被铭记。🕯️'

  return `${eulogy}\n\n${ending}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  // Rate limit
  const rateLimit = await checkRateLimit(`ai-eulogy:${session.user.id}`, 5, 60)
  if (!rateLimit.allowed) return NextResponse.json({ error: '操作太频繁，请稍后再试' }, { status: 429 })

  const supabase = getSupabase()
  const { id } = params

  // Get the tombstone
  const { data: tombstone, error } = await supabase
    .from('tombstones')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tombstone) {
    return NextResponse.json({ error: '墓碑不存在' }, { status: 404 })
  }

  // Generate eulogy
  const content = generateEulogy(
    tombstone.code_name,
    tombstone.cause_of_death,
    tombstone.language
  )

  // Save as a eulogy
  const { data: eulogy, error: insertError } = await supabase
    .from('eulogies')
    .insert({
      tombstone_id: id,
      user_id: session.user.id,
      username: '🤖 AI 悼词师',
      avatar_url: session.user.image || '',
      content,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Atomic increment eulogy count
  // Atomic increment (best effort - falls back gracefully)
  try {
    129|  await supabase.rpc('increment_counter', { row_id: id, column_name: 'eulogy_count' })
  } catch (_) {}

  return NextResponse.json(eulogy, { status: 201 })
}
