import Database from 'tauri-plugin-sql-api';

export const HISTORY_TABLE_SQL =
    'CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, source TEXT NOT NULL, target TEXT NOT NULL, service TEXT NOT NULL, result TEXT NOT NULL, timestamp INTEGER NOT NULL)';

/**
 * 加载历史数据库并确保表存在。
 * 注意：tauri-plugin-sql 的数据库连接以名称为键全局共享，
 * 这里不调用 close()，避免关闭其他窗口正在使用的连接。
 */
export async function loadHistoryDb() {
    const db = await Database.load('sqlite:history.db');
    await db.execute(HISTORY_TABLE_SQL);
    return db;
}
