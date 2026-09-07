/**
 * Inicialización de tabla users.
 */
const db = require("../config/database");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        birth_date TEXT,
        gender TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

for (const column of ['birth_date', 'gender']) {
    try { db.exec(`ALTER TABLE users ADD COLUMN ${column} TEXT`); } catch {}
}

db.exec(`
    CREATE TABLE IF NOT EXISTS app_data (
        id TEXT NOT NULL,
        resource TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, resource, user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);