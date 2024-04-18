import Database from 'better-sqlite3';
import { DB_PATH } from '$env/static/private';
import {
    TransactionType,
    type Department,
    type Inventory,
    type Item,
    type ItemType,
    type Transaction,
    type User,
} from './types';

const db = new Database(DB_PATH, { verbose: console.log });
db.pragma('journal_mode = WAL');

export default db;

// USERS
export function getUser(username: string) {
    const stmt = db.prepare('SELECT * FROM user WHERE username = ?');
    return stmt.get(username) as User;
}

// session
export function createSession(userId: number) {
    // const stmt = db.prepare('INSERT INTO session (id, user_id) VALUES (?, ?)');
    // const sessionId = crypto.randomBytes(16).toString('hex');
}

export function getSession(sessionId: string) {
    const stmt = db.prepare(
        `SELECT session.*, user.* 
        FROM session INNER JOIN user ON session.user_id = user.id
        WHERE session.id = ?`,
    );
    return stmt.get(sessionId);
}

// ITEM
export function listItem(type: ItemType) {
    const stmt = db.prepare(`SELECT * FROM item WHERE type = ?`);
    return stmt.all(type);
}

export function listItemName(type: ItemType) {
    const stmt = db.prepare(`SELECT DISTINCT name FROM item WHERE type = ?`);
    return stmt.all(type);
}

export function listItemV2(type: ItemType, name: string) {
    const stmt = db.prepare(`SELECT * FROM item WHERE name = ? AND type = ?`);
    return stmt.all(name, type);
}

export function listItemStorage(type: ItemType, name?: string) {
    let query = `SELECT * FROM item WHERE type = ? AND quantity > 0`;
    let params: string[] = [type];
    if (name) {
        query = query.concat(` AND name = ?`);
        params.push(name);
    }
    const stmt = db.prepare(query);
    return stmt.all(params);
}

export function listItemStorageName(type: ItemType) {
    const stmt = db.prepare(
        `SELECT DISTINCT i.name
        FROM item i
        WHERE i.type = ? AND i.quantity > 0`,
    );
    return stmt.all(type);
}

export function listItemDepartment(
    type: ItemType,
    departmentId: number,
    name?: string,
    full: boolean = false,
) {
    let query = `SELECT i.id, i.name, i.code, i.type, i.author, i.year, i.note, idept.supply_date, idept.return_date, idept.quantity
        FROM itemdepartment idept INNER JOIN item i
        ON idept.item_id = i.id
        WHERE i.type = $type AND 
            idept.department_id = $departmentId`;
    if (name) {
        query = query.concat(` AND i.name = $name`);
    }
    if (!full) {
        query = query.concat(` AND idept.quantity > 0`);
    }
    const stmt = db.prepare(query);
    return stmt.all({ type, departmentId, name }) as Item[];
}

export function listItemDepartmentName(type: ItemType, departmentId: number) {
    const stmt = db.prepare(
        `SELECT DISTINCT i.name
        FROM itemdepartment idept INNER JOIN item i
        ON idept.item_id = i.id
        WHERE i.type = ? AND idept.department_id = ? AND idept.quantity > 0`,
    );
    return stmt.all(type, departmentId);
}

export function importItems(itemList: Item[]) {
    db.transaction(() => {
        for (const item of itemList) {
            db.prepare(
                `INSERT INTO item (name, type, code, author, year, note, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ).run(
                item.name,
                item.type,
                item.code,
                item.author,
                item.year,
                item.note,
                item.quantity,
            );
        }
    })();
}

export function supplyItemV2(
    itemList: { id: number; quantity: number }[],
    departmentId: number,
    date: string,
) {
    const resultIds = [];
    const actionType = TransactionType.Supply;
    db.transaction(() => {
        for (const item of itemList) {
            const storageRunResult = db
                .prepare(`UPDATE item SET quantity = quantity - ? WHERE id = ? AND quantity >= ?`)
                .run(item.quantity, item.id, item.quantity);
            if (storageRunResult.changes === 0) {
                console.log('Insufficient quantity available');
                throw new Error('Insufficient quantity available');
            }
            const departmentRunResult = db
                .prepare(
                    `INSERT INTO itemdepartment (item_id, department_id, quantity, supply_date)
                    VALUES ($itemId, $departmentId, $quantity, $date)
                    ON CONFLICT(item_id, department_id) DO
                    UPDATE SET quantity = quantity + $quantity`,
                )
                .run({
                    itemId: item.id,
                    departmentId,
                    quantity: item.quantity,
                    date,
                });
            if (departmentRunResult.changes === 0) {
                console.log('Error updating department');
                throw new Error('Error updating department');
            }
            const logResult = db
                .prepare(
                    `INSERT INTO actionlog (item_id, department_id, quantity, type, date) VALUES (?, ?, ?, ?, ?)`,
                )
                .run(item.id, departmentId, item.quantity, actionType, date);
            if (logResult.changes === 0) {
                console.log('Error updating log');
                throw new Error('Error updating log');
            }
            resultIds.push(logResult.lastInsertRowid);
        }
    })();
    return resultIds;
}

export function returnItemV2(
    itemList: { id: number; quantity: number }[],
    departmentId: number,
    date: string,
) {
    const resultIds = [];
    const actionType = TransactionType.Return;
    db.transaction(() => {
        for (const item of itemList) {
            const departmentRunResult = db
                .prepare(
                    `UPDATE itemdepartment 
            SET quantity = quantity - $quantity, return_date = $date
            WHERE item_id = $itemId AND 
                department_id = $departmentId AND 
                quantity >= $quantity`,
                )
                .run({
                    itemId: item.id,
                    departmentId,
                    quantity: item.quantity,
                    date,
                });
            if (departmentRunResult.changes === 0) {
                console.log('Insufficient quantity available');
                throw new Error('Insufficient quantity available');
            }
            const storageRunResult = db
                .prepare(`UPDATE item SET quantity = quantity + $quantity WHERE id = $itemId`)
                .run({ itemId: item.id, quantity: item.quantity });
            if (storageRunResult.changes === 0) {
                console.log('Error updating storage');
                throw new Error('Error updating storage');
            }
            const logResult = db
                .prepare(
                    `INSERT INTO actionlog (item_id, department_id, quantity, type, date) VALUES (?, ?, ?, ?, ?)`,
                )
                .run(item.id, departmentId, item.quantity, actionType, date);
            resultIds.push(logResult.lastInsertRowid);
        }
    })();
    return resultIds;
}

export function importItem(
    name: string,
    code: string | null,
    type: ItemType,
    quantity: number,
    author: string | null,
    year: string | null,
    note: string | null,
) {
    const transaction = () => {
        db.prepare(
            `INSERT INTO items (name, type, code, author, year, note, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ).run(name, type, code, author, year, note, quantity);
    };
    db.transaction(() => {
        // Insert new item into items table if it doesn't exist
        db.prepare(
            `INSERT OR IGNORE INTO items (name, type, author, year, note) VALUES (?, ?, ?, ?, ?)`,
        ).run(name, type, author, year, note);

        // Get the id of the item
        const itemId = db
            .prepare(`SELECT id FROM item WHERE name = ? AND type = ?`)
            .get(name, type).id;

        const itemIdInInventory = db
            .prepare(`SELECT id FROM inventory WHERE item_id = ? AND code = ?`)
            .get(itemId, code);

        if (itemIdInInventory) {
            // Update the quantity of the item
            db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE id = ?').run(
                quantity,
                itemIdInInventory.id,
            );
        } else {
            // Insert the new item into the items table
            db.prepare('INSERT INTO inventory (item_id, code, quantity) VALUES (?, ?, ?)').run(
                itemId,
                code,
                quantity,
            );
        }
    })();
}

// DEPARTMENT
export function listDepartment(offset?: number, limit?: number) {
    const stmt = db.prepare('SELECT * from department WHERE is_deleted = 0');
    const count = db.prepare('SELECT COUNT(*) from department WHERE is_deleted = 0').get();
    // if (offset && limit) {
    //     const data = stmt.all().slice(offset, limit);
    //     const pagination = {
    //         offset,
    //         limit,
    //         total: count['COUNT(*)'],
    //     };
    //     return { data, pagination };
    // }
    return stmt.all() as Department[];
}

export function addDepartment(name: string) {
    try {
        const insert = db.prepare(
            `INSERT INTO department (name, is_deleted) VALUES (?, 0)
        ON CONFLICT(name) DO UPDATE SET is_deleted = 0`,
        );
        const transaction = db.transaction(() => {
            const info = insert.run(name);
            console.log(`Inserted ${info.changes} rows with ID ${info.lastInsertRowid}`);
        });
        transaction();
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export function removeDepartment(department_id: string) {
    try {
        const id = Number(department_id);
        const query = db.prepare('UPDATE departments SET is_deleted = 1 WHERE id = ?');
        const transaction = db.transaction(() => {
            const info = query.run(id);
        });
        transaction();
    } catch (err) {
        console.log(err);
        throw err;
    }
}

// INVENTORY
export function listInventory(
    type: ItemType | null,
    department_id: string,
    item_id: string | null,
) {
    let sql = `
    SELECT it.name, iv.* FROM item it 
    INNER JOIN inventory iv ON iv.item_id = it.id
    WHERE iv.department_id = ?`;
    const params = [department_id];
    if (item_id) {
        sql += ` AND iv.item_id = ?`;
        params.push(item_id);
    }
    if (type) {
        sql += ` AND it.type = ?`;
        params.push(type);
    }
    const stmt = db.prepare(sql);
    return stmt.all(params);
}

export function listItemByDepartment(type: ItemType, department_id?: number) {
    let query: string;
    if (!department_id) {
        query = `SELECT it.name, iv.* 
                FROM item it INNER JOIN inventory iv 
                ON iv.item_id = it.id
                WHERE 
                    it.type = $type AND 
                    iv.department_id IS NULL`;
    } else {
        query = `SELECT DISTINCT it.*
                FROM item it INNER JOIN inventory iv
                ON iv.item_id = it.id
                WHERE
                    it.type = $type AND 
                    iv.department_id = $department_id`;
    }
    const stmt = db.prepare(query);
    return stmt.all({ type, department_id });
}

export function listItemByDepartmentV2(type: ItemType, department_id?: number) {
    let query = `SELECT iv.*, it.name, it.author, it.year, it.note
                    FROM inventory iv INNER JOIN items it
                    ON iv.item_id = it.id
                    WHERE it.type = ?`;
    let params: any[] = [type];
    if (department_id) {
        query += ` AND iv.department_id = ?`;
        params.push(department_id);
    }
    const stmt = db.prepare(query);
    return stmt.all(params);
}

export function supplyItem(item_id: number, department_id: number, quantity: number, date: string) {
    const transactionType = TransactionType.Supply;
    const inventory = db
        .prepare(
            `SELECT * FROM inventory WHERE (
                item_id = ? AND
                department_id IS NULL AND
                code IS NULL)`,
        )
        .get(item_id);

    let finalResult = [];

    if (inventory) {
        if (inventory.quantity < quantity) {
            console.log('Insufficient quantity available');
            return;
        }

        db.transaction(() => {
            db.prepare(
                `INSERT OR IGNORE INTO inventory (
          item_id, department_id, quantity
        ) VALUES (?, ?, 0)`,
            ).run(item_id, department_id);
            db.prepare(
                'UPDATE inventory SET quantity = quantity + ? WHERE item_id = ? AND department_id = ?',
            ).run(quantity, item_id, department_id);
            db.prepare(
                'UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND department_id IS NULL',
            ).run(quantity, item_id);
            let result = db
                .prepare(
                    'INSERT INTO transactions (item_id, quantity, department_id, transaction_type, date) VALUES (?, ?, ?, ?, ?)',
                )
                .run(item_id, quantity, department_id, transactionType, date);

            finalResult.push(result.lastInsertRowid);
        })();
    } else {
        const invens = db
            .prepare(
                `SELECT * FROM inventory WHERE (
        item_id = ? AND
        department_id IS NULL AND
        code IS NOT NULL
        )
        LIMIT ?
      `,
            )
            .all(item_id, quantity);

        if (invens.length < quantity) {
            console.log('Insufficient quantity available');
            return;
        }

        db.transaction(() => {
            for (const inv of invens) {
                db.prepare('UPDATE inventory SET department_id = ? WHERE id = ?').run(
                    department_id,
                    inv.id,
                );
                let result = db
                    .prepare(
                        'INSERT INTO transactions (item_id, code, quantity, department_id, transaction_type, date) VALUES (?, ?, ?, ?, ?, ?)',
                    )
                    .run(item_id, inv.code, inv.quantity, department_id, transactionType, date);
                finalResult.push(result.lastInsertRowid);
            }
        })();
    }
    return finalResult;
}

export function returnItem(item_id: number, department_id: number, quantity: number, date: string) {
    const transactionType = TransactionType.Return;
    const inventory = db
        .prepare(
            `SELECT * FROM inventory WHERE (
          item_id = ? AND
          department_id = ? AND
          code IS NULL
        )`,
        )
        .get(item_id, department_id);

    let finalResult = [];

    if (inventory) {
        if (inventory.quantity < quantity) {
            console.log('Insufficient quantity available');
            return;
        }

        db.transaction(() => {
            db.prepare(
                'UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND department_id = ?',
            ).run(quantity, item_id, department_id);
            db.prepare(
                'UPDATE inventory SET quantity = quantity + ? WHERE item_id = ? AND department_id IS NULL',
            ).run(quantity, item_id);
            let result = db
                .prepare(
                    'INSERT INTO transactions (item_id, quantity, department_id, transaction_type, date) VALUES (?, ?, ?, ?, ?)',
                )
                .run(item_id, quantity, department_id, transactionType, date);

            finalResult.push(result.lastInsertRowid);
        })();
    } else {
        console.log(item_id, quantity, department_id, date);
        const invens = db
            .prepare(
                `SELECT * FROM inventory WHERE (
          item_id = ? AND
          department_id = ? AND
          code IS NOT NULL
          )
          LIMIT ?
        `,
            )
            .all(item_id, department_id, quantity);

        if (invens.length < quantity) {
            console.log('Insufficient quantity available');
            return;
        }

        db.transaction(() => {
            for (const inv of invens) {
                db.prepare('UPDATE inventory SET department_id = NULL WHERE id = ?').run(inv.id);
                let result = db
                    .prepare(
                        'INSERT INTO transactions (item_id, code, quantity, department_id, transaction_type, date) VALUES (?, ?, ?, ?, ?, ?)',
                    )
                    .run(item_id, inv.code, inv.quantity, department_id, transactionType, date);
                finalResult.push(result.lastInsertRowid);
            }
        })();
    }
    return finalResult;
}

// TRANSACTION
export function viewTransactions(department_id: number, type: TransactionType) {
    const sql = `SELECT items.name, txn.* 
                FROM transactions txn INNER JOIN items ON txn.item_id = items.id
                WHERE txn.department_id = ? AND txn.type = ?`;
    const stmt = db.prepare(sql);
    return stmt.all(department_id, type) as Transaction[];
}

export function viewTransactionsByIds(ids: number[]) {
    const sql = `SELECT items.name, txn.* 
        FROM transactions txn INNER JOIN items ON txn.item_id = items.id
        WHERE txn.id = ?`;
    const stmt = db.prepare(sql);
    const myTransaction = db.transaction((ids: number[]) => {
        return ids.map((id) => stmt.get(id));
    });
    return myTransaction(ids) as Transaction[];
}
