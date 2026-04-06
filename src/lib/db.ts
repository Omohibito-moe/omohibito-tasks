import Database from 'better-sqlite3'
import path from 'path'
import type { Task, TimelineItem, Criterion, Status } from './types'

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'omohibito.db')

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined
}

function getDb(): Database.Database {
  if (!global.__db) {
    global.__db = new Database(DB_PATH)
    global.__db.pragma('journal_mode = WAL')
    global.__db.pragma('foreign_keys = ON')
    initSchema(global.__db)
  }
  return global.__db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business TEXT NOT NULL,
      level TEXT NOT NULL,
      parent_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      assignee TEXT,
      deadline TEXT,
      notes TEXT,
      status TEXT DEFAULT '未着手' CHECK (status IN ('未着手', '進行中', '完了', '保留')),
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS timeline_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business TEXT NOT NULL,
      task_name TEXT NOT NULL,
      months TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS criteria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business TEXT NOT NULL,
      deadline TEXT,
      category TEXT,
      description TEXT
    );
  `)
}

export function isSeeded(): boolean {
  const db = getDb()
  const row = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }
  return row.count > 0
}

export function getAllTasks(filters?: {
  business?: string
  status?: string
  level?: string
  assignee?: string
}): Task[] {
  const db = getDb()
  let query = 'SELECT * FROM tasks WHERE 1=1'
  const params: string[] = []

  if (filters?.business) {
    query += ' AND business = ?'
    params.push(filters.business)
  }
  if (filters?.status) {
    query += ' AND status = ?'
    params.push(filters.status)
  }
  if (filters?.level) {
    query += ' AND level = ?'
    params.push(filters.level)
  }
  if (filters?.assignee) {
    query += ' AND assignee LIKE ?'
    params.push(`%${filters.assignee}%`)
  }

  query += ' ORDER BY business, sort_order, id'
  return db.prepare(query).all(...params) as Task[]
}

export function getTaskById(id: number): Task | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined
}

export function createTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO tasks (business, level, parent_id, name, assignee, deadline, notes, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    data.business, data.level, data.parent_id, data.name,
    data.assignee, data.deadline, data.notes, data.status, data.sort_order
  )
  return getTaskById(result.lastInsertRowid as number)!
}

export function updateTask(id: number, data: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Task | undefined {
  const db = getDb()
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = Object.values(data)
  db.prepare(`UPDATE tasks SET ${fields}, updated_at = datetime('now', 'localtime') WHERE id = ?`).run(...values, id)
  return getTaskById(id)
}

export function deleteTask(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

export function getTimelineItems(): TimelineItem[] {
  const db = getDb()
  return db.prepare('SELECT * FROM timeline_items ORDER BY sort_order, id').all() as TimelineItem[]
}

export function getCriteria(business?: string): Criterion[] {
  const db = getDb()
  if (business) {
    return db.prepare('SELECT * FROM criteria WHERE business = ? ORDER BY id').all(business) as Criterion[]
  }
  return db.prepare('SELECT * FROM criteria ORDER BY business, id').all() as Criterion[]
}

export function getProgressByBusiness(): Array<{ business: string; total: number; done: number }> {
  const db = getDb()
  return db.prepare(`
    SELECT business,
      COUNT(*) as total,
      SUM(CASE WHEN status = '完了' THEN 1 ELSE 0 END) as done
    FROM tasks
    WHERE level = '小タスク'
    GROUP BY business
    ORDER BY business
  `).all() as Array<{ business: string; total: number; done: number }>
}

export function getWeeklyTasks(): Task[] {
  const db = getDb()
  // Tasks with deadlines containing keywords indicating near-term
  return db.prepare(`
    SELECT * FROM tasks
    WHERE level = '小タスク'
      AND status != '完了'
      AND (deadline LIKE '%4月%' OR deadline LIKE '%即%')
    ORDER BY business, sort_order
    LIMIT 20
  `).all() as Task[]
}

export function seedDatabase(seedFn: (db: Database.Database) => void): void {
  const db = getDb()
  seedFn(db)
}

export { getDb }
