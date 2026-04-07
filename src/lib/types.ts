export type Status = '未着手' | '今日やる' | '進行中' | '完了'
export type Level = '大タスク' | '中タスク' | '小タスク'
export type Business = 'コンシェルジュ' | 'DX事業' | 'リスキリング' | 'ケアガイド' | '資金調達' | '集客戦略サマリー'

export interface Task {
  id: number
  business: Business
  level: Level
  parent_id: number | null
  name: string
  assignee: string | null
  deadline: string | null
  notes: string | null
  status: Status
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TimelineItem {
  id: number
  business: string
  task_name: string
  months: string // JSON: {month: string, type: '●'|'○'|null}[]
  sort_order: number
}

export interface Criterion {
  id: number
  business: string
  deadline: string
  category: string
  description: string
}

export const BUSINESSES: Business[] = [
  'コンシェルジュ',
  'DX事業',
  'リスキリング',
  'ケアガイド',
  '資金調達',
  '集客戦略サマリー',
]

export const STATUSES: Status[] = ['未着手', '今日やる', '進行中', '完了']

export const BUSINESS_COLORS: Record<Business, string> = {
  'コンシェルジュ': '#5B8FB9',
  'DX事業': '#9B72CF',
  'リスキリング': '#E8945A',
  'ケアガイド': '#D4756B',
  '資金調達': '#6B8E7B',
  '集客戦略サマリー': '#B5A27F',
}

export const BUSINESS_BG: Record<Business, string> = {
  'コンシェルジュ': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  'DX事業': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  'リスキリング': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  'ケアガイド': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  '資金調達': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  '集客戦略サマリー': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
}

export const STATUS_COLORS: Record<Status, string> = {
  '未着手': 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  '今日やる': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  '進行中': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  '完了': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
}

export const MONTHS = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月']
