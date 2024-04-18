'use strict';

import Database from 'better-sqlite3';

function reset() {
    // Open a database handle
    const dbPath = process.env.DB_PATH;
    const db = new Database(dbPath);

    // Truncate tables
    const resetTransaction = () => {
        const tables = ['actionlog', 'itemdepartment', 'item'];
        for (const table of tables) {
            db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
        }

        // Create items table to manage different types of items
        db.prepare(
            `CREATE TABLE IF NOT EXISTS item (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                type TEXT,
                code TEXT NULL,
                author TEXT NULL,
                year TEXT NULL,
                note TEXT NULL,
                quantity INTEGER,
                UNIQUE (name, code)
            )`,
        ).run();
        db.prepare(`CREATE INDEX IF NOT EXISTS index_name ON item (name)`).run();

        db.prepare(
            `CREATE TABLE IF NOT EXISTS itemdepartment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_id INTEGER NULL,
            item_id INTEGER,
            quantity INTEGER,
            supply_date TEXT NULL,
            return_date TEXT NULL,
            FOREIGN KEY(department_id) REFERENCES department(id),
            FOREIGN KEY(item_id) REFERENCES item(id),
            UNIQUE (department_id, item_id)
        )`,
        ).run();

        // Create actionlog table to record movements of items between people
        db.prepare(
            `CREATE TABLE IF NOT EXISTS actionlog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            department_id INTEGER,
            quantity INTEGER,
            type TEXT,
            date TEXT,
            FOREIGN KEY(item_id) REFERENCES item(id)
            FOREIGN KEY(department_id) REFERENCES department(id)
        )`,
        ).run();
    };
    db.transaction(resetTransaction)();

    // Close the database handle
    db.close();
}

reset();
