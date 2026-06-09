import * as SQLite from 'expo-sqlite';

const DB_NAME = 'meudiariofinanceiro.db';
const DB_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync(`PRAGMA user_version = ${DB_VERSION};`);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id              TEXT PRIMARY KEY NOT NULL,
      type            TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount          REAL NOT NULL,
      description     TEXT NOT NULL,
      category        TEXT NOT NULL,
      date            TEXT NOT NULL,
      is_recurring    INTEGER NOT NULL DEFAULT 0,
      recurrence_rule TEXT,
      notes           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id    TEXT PRIMARY KEY NOT NULL,
      name  TEXT NOT NULL UNIQUE,
      icon  TEXT,
      color TEXT,
      type  TEXT NOT NULL CHECK(type IN ('income', 'expense', 'both'))
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS debts (
      id            TEXT PRIMARY KEY NOT NULL,
      creditor      TEXT NOT NULL,
      total_amount  REAL NOT NULL,
      paid_amount   REAL NOT NULL DEFAULT 0,
      interest_rate REAL NOT NULL DEFAULT 0,
      due_date      TEXT,
      notes         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
  `);

  await seedDefaultCategories(database);
}

async function seedDefaultCategories(database: SQLite.SQLiteDatabase): Promise<void> {
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories',
  );

  if (existing && existing.count > 0) return;

  const defaultCategories = [
    {
      id: 'cat_alimentacao',
      name: 'Alimentação',
      icon: '🍽️',
      color: '#E07B39',
      type: 'expense',
    },
    {
      id: 'cat_transporte',
      name: 'Transporte',
      icon: '🚗',
      color: '#5B8DB8',
      type: 'expense',
    },
    { id: 'cat_saude', name: 'Saúde', icon: '💊', color: '#6BAE75', type: 'expense' },
    {
      id: 'cat_educacao',
      name: 'Educação',
      icon: '📚',
      color: '#9B72B0',
      type: 'expense',
    },
    { id: 'cat_lazer', name: 'Lazer', icon: '🎮', color: '#E8A838', type: 'expense' },
    { id: 'cat_moradia', name: 'Moradia', icon: '🏠', color: '#C0634B', type: 'expense' },
    {
      id: 'cat_contas',
      name: 'Contas fixas',
      icon: '📄',
      color: '#7A9E9F',
      type: 'expense',
    },
    { id: 'cat_salario', name: 'Salário', icon: '💼', color: '#4CAF50', type: 'income' },
    {
      id: 'cat_freelance',
      name: 'Freelance',
      icon: '💻',
      color: '#2196F3',
      type: 'income',
    },
    {
      id: 'cat_outros_receita',
      name: 'Outras receitas',
      icon: '💰',
      color: '#8BC34A',
      type: 'income',
    },
    { id: 'cat_outros', name: 'Outros', icon: '📌', color: '#9E9E9E', type: 'both' },
  ];

  for (const category of defaultCategories) {
    await database.runAsync(
      'INSERT OR IGNORE INTO categories (id, name, icon, color, type) VALUES (?, ?, ?, ?, ?)',
      [category.id, category.name, category.icon, category.color, category.type],
    );
  }
}
