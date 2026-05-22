import { CauseOfDeath } from '@/types'

export const CAUSE_OF_DEATH_LABELS: Record<CauseOfDeath, { label: string; emoji: string; color: string }> = {
  refactored: { label: '重构牺牲', emoji: '🔪', color: 'text-red-400' },
  deleted_by_mistake: { label: '误删手滑', emoji: '💀', color: 'text-purple-400' },
  project_abandoned: { label: '项目废弃', emoji: '🏚️', color: 'text-gray-400' },
  client_requirements: { label: '甲方砍需求', emoji: '🤡', color: 'text-yellow-400' },
  tech_obsolete: { label: '技术过时', emoji: '⚰️', color: 'text-blue-400' },
  mystery_bug: { label: '玄学Bug', emoji: '🎭', color: 'text-pink-400' },
  rewritten: { label: '推倒重写', emoji: '🔥', color: 'text-orange-400' },
  other: { label: '其他原因', emoji: '🪦', color: 'text-gray-500' },
}

export const CAUSE_OPTIONS: CauseOfDeath[] = [
  'refactored',
  'deleted_by_mistake',
  'project_abandoned',
  'client_requirements',
  'tech_obsolete',
  'mystery_bug',
  'rewritten',
  'other',
]
