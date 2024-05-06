import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

function setup() {
    // Check if directory exists
    const dbPath = process.env.DB_PATH || './data/data.db';
    if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    const db = new Database(dbPath, { verbose: console.log });

    db.transaction(() => {
        // Create user table
        db.prepare(
            `CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
        )`,
        ).run();

        db.prepare(
            `CREATE TABLE IF NOT EXISTS session (
            id TEXT NOT NULL PRIMARY KEY,
            expires_at INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user(id)
        )`,
        ).run();

        // Create department table
        db.prepare(
            `CREATE TABLE IF NOT EXISTS department (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            is_deleted INTEGER
        )`,
        ).run();

        // Create items table to manage different types of items
        // db.prepare(
        //     `CREATE TABLE IF NOT EXISTS items (
        //     id INTEGER PRIMARY KEY AUTOINCREMENT,
        //     name TEXT,
        //     type TEXT,
        //     author TEXT NULL,
        //     year TEXT NULL,
        //     note TEXT NULL,
        //     UNIQUE (type, name)
        // )`,
        // ).run();

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
            `create table if not exists equipment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                code TEXT NULL,
                note TEXT NULL,
                quantity INTEGER,
                sync text null,
                before_status text null,
                after_status text null,
                UNIQUE (name, code)
            )`,
        ).run();
        db.prepare(`CREATE INDEX IF NOT EXISTS index_name ON equipment (name)`).run();

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

        db.prepare(
            `CREATE TABLE IF NOT EXISTS equipmentdepartment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_id INTEGER NULL,
            equipment_id INTEGER,
            quantity INTEGER,
            supply_date TEXT NULL,
            return_date TEXT NULL,
            sync text null,
            before_status text null,
            after_status text null,
            FOREIGN KEY(department_id) REFERENCES department(id),
            FOREIGN KEY(equipment_id) REFERENCES equipment(id),
            UNIQUE (department_id, equipment_id)
        )`,
        ).run();

        // Create actionlog table to record movements of items between people
        db.prepare(
            `CREATE TABLE IF NOT EXISTS actionlog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NULL,
            equipment_id INTEGER NULL,
            department_id INTEGER,
            quantity INTEGER,
            type TEXT,
            date TEXT,
            FOREIGN KEY(item_id) REFERENCES item(id),
            FOREIGN KEY(equipment_id) REFERENCES equipment(id),
            FOREIGN KEY(department_id) REFERENCES department(id)
        )`,
        ).run();

        const username = 'admin';
        const password = 'password';
        const hashedPassword = bcrypt.hashSync(password, 10);

        db.prepare('INSERT OR IGNORE INTO user (username, password, role) VALUES (?, ?, ?)').run(
            username,
            hashedPassword,
            'admin',
        );
    })();

    // Close the database handle
    db.close();
}

// Function to get a list of items per type
function getItemsByType(itemType) {
    const items = db.prepare('SELECT * FROM items WHERE type = ?').all(itemType);
    return items;
}

// Function to list departmentanizations
function listdepartment() {
    const departments = db.prepare('SELECT * FROM department').all();
    return departments;
}

// Function to move items from one person to another
function moveItems(itemId, itemName, itemQuantity, itemType, fromPersonId, toPersonId) {
    const item = db
        .prepare(
            'SELECT * FROM items WHERE id = ? OR (name = ? AND type = ? AND id IS NULL AND quantity >= ?) LIMIT 1',
        )
        .get(itemId, itemName, itemType, itemQuantity);
    if (!item) {
        console.log('Item not found or insufficient quantity available');
        return;
    }

    db.transaction(() => {
        if (item.id === null) {
            db.prepare('UPDATE items SET quantity = quantity - ? WHERE name = ? AND type = ?').run(
                itemQuantity,
                itemName,
                itemType,
            );
        } else {
            db.prepare('DELETE FROM items WHERE id = ?').run(itemId);
        }
        db.prepare(
            'INSERT INTO transactions (item_id, quantity, from_person_id, to_person_id) VALUES (?, ?, ?, ?)',
        ).run(itemId, itemQuantity, fromPersonId, toPersonId);
    })();

    console.log(
        `Moved ${itemQuantity} "${itemName}" of type "${itemType}" from person ${fromPersonId} to person ${toPersonId}`,
    );
}

// Function to return items from a person to their original person
function returnItems(itemId, itemName, itemQuantity, itemType, originalPersonId) {
    const lastTransaction = db
        .prepare(
            'SELECT * FROM transactions WHERE item_id = ? AND quantity = ? ORDER BY transaction_date DESC LIMIT 1',
        )
        .get(itemId, itemQuantity);
    if (!lastTransaction) {
        console.log('No transaction record found for these items');
        return;
    }

    db.transaction(() => {
        if (itemId === null) {
            db.prepare('UPDATE items SET quantity = quantity + ? WHERE name = ? AND type = ?').run(
                itemQuantity,
                itemName,
                itemType,
            );
        } else {
            db.prepare(
                'INSERT INTO items (id, name, quantity, type, person_id) VALUES (?, ?, ?, ?, ?)',
            ).run(itemId, itemName, itemQuantity, itemType, originalPersonId);
        }
        db.prepare('UPDATE transactions SET return_date = CURRENT_TIMESTAMP WHERE id = ?').run(
            lastTransaction.id,
        );
    })();

    console.log(
        `Returned ${itemQuantity} "${itemName}" of type "${itemType}" to person ${originalPersonId}`,
    );
}

export default setup;

setup();
