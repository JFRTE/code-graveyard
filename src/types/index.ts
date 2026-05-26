export interface Tombstone {
  id: string
  user_id: string
  username: string
  avatar_url: string
  code_name: string
  code_content: string
  language: string
  cause_of_death: string
  birth_date: string
  death_date: string
  description: string
  flower_count: number
  eulogy_count: number
  candle_count: number
  view_count: number
  tags: string[]
  created_at: string
}

export interface Eulogy {
  id: string
  tombstone_id: string
  user_id: string
  username: string
  avatar_url: string
  content: string
  created_at: string
}

export interface Flower {
  id: string
  tombstone_id: string
  user_id: string
  created_at: string
}

export interface Candle {
  id: string
  tombstone_id: string
  user_id: string
  created_at: string
}

export interface GlobalStats {
  total_tombstones: number
  total_eulogies: number
  total_flowers: number
  top_causes: { cause: string; count: number }[]
}

export type CauseOfDeath =
  | 'refactored'
  | 'deleted_by_mistake'
  | 'project_abandoned'
  | 'client_requirements'
  | 'tech_obsolete'
  | 'mystery_bug'
  | 'rewritten'
  | 'other'
