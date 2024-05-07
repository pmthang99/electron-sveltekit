import db from '.';
import { TransactionType } from './types';

export function listEquipment() {
    return db.prepare('SELECT * FROM equipment').all();
}

export function listEquipmentDistinct(): string[] {
    return db.prepare('SELECT DISTINCT name FROM equipment').pluck().all() as string[];
}

export function listEquipmentByName(name: string) {
    return db.prepare('SELECT * FROM equipment WHERE name = ?').all(name);
}

export function listEquipmentStorage() {
    return db.prepare('SELECT * FROM equipment WHERE quantity > 0').all();
}

export function listEquipmentStorageDistinct(): string[] {
    return db
        .prepare('SELECT DISTINCT name FROM equipment WHERE quantity > 0')
        .pluck()
        .all() as string[];
}

export function listEquipmentStorageByName(name: string) {
    return db.prepare('SELECT * FROM equipment WHERE name = ? AND quantity > 0').all(name);
}

export function listEquipmentDepartment(departmentId: number, all = false) {
    let query = `SELECT eq.id, eq.name, eq.code, eq.sync, eqd.quantity, eqd.supply_date, eqd.return_date, eq.before_status, eq.after_status
    FROM equipment eq INNER JOIN equipmentdepartment eqd
    ON eq.id = eqd.equipment_id
    WHERE eqd.department_id = ?`;
    if (!all) {
        query += ' AND eqd.quantity > 0';
    }
    return db.prepare(query).all(departmentId);
}

export function listEquipmentDepartmentDistinct(departmentId: number, all = false): string[] {
    let query = `SELECT DISTINCT eq.name
    FROM equipment eq INNER JOIN equipmentdepartment eqd
    ON eq.id = eqd.equipment_id
    WHERE eqd.department_id = ?`;
    if (!all) {
        query += ' AND eqd.quantity > 0';
    }
    return db.prepare(query).pluck().all(departmentId) as string[];
}

export function listEquipmentDepartmentByName(departmentId: number, name: string, all = false) {
    let query = `SELECT eq.id, eq.name, eq.code, eq.sync, eqd.quantity, eqd.supply_date, eqd.return_date, eq.before_status, eq.after_status
    FROM equipment eq INNER JOIN equipmentdepartment eqd
    ON eq.id = eqd.equipment_id
    WHERE eqd.department_id = ? AND eq.name = ?`;
    if (!all) {
        query += ' AND eqd.quantity > 0';
    }
    return db.prepare(query).all(departmentId, name);
}

export function importEquipment(items: any[]) {
    db.transaction(() => {
        for (const item of items) {
            db.prepare(
                `INSERT INTO equipment (name, code, quantity, sync, before_status, after_status)
                VALUES ($name, $code, $quantity, $sync, $before_status, $after_status)`,
            ).run(item);
        }
    })();
}

export function supplyEquipment(
    items: { id: number; quantity: number; before_status: string }[],
    department_id: number,
    date: string,
) {
    const results = [];
    const actionType = TransactionType.Supply;
    const transaction = () => {
        const updateStorageQuery = db.prepare(`UPDATE equipment
        SET quantity = quantity - $quantity
        WHERE id = $id AND quantity >= $quantity`);

        const insertDepartmentQuery = db.prepare(
            `INSERT INTO equipmentdepartment
            (equipment_id, department_id, quantity, supply_date, before_status)
            VALUES ($id, $department_id, $quantity, $date, $before_status)
            ON CONFLICT(equipment_id, department_id) DO UPDATE
            SET quantity = quantity + $quantity`,
        );

        for (const item of items) {
            const updateStorage = updateStorageQuery.run({
                id: item.id,
                quantity: item.quantity,
            });
            if (updateStorage.changes === 0) {
                throw new Error('Insufficient quantity');
            }

            const insertDepartment = insertDepartmentQuery.run({
                id: item.id,
                department_id,
                quantity: item.quantity,
                date,
                before_status: item.before_status,
            });
            if (insertDepartment.changes === 0) {
                throw new Error('Failed to update department storage');
            }

            const logResult = db
                .prepare(
                    `INSERT INTO actionlog (equipment_id, department_id, quantity, type, date) VALUES (?, ?, ?, ?, ?)`,
                )
                .run(item.id, department_id, item.quantity, actionType, date);
            if (logResult.changes === 0) {
                throw new Error('Failed to log action');
            }
            results.push(logResult.lastInsertRowid);
        }
    };
    db.transaction(transaction)();
    return results;
}

export function returnEquipment(
    items: { id: number; quantity: number; after_status: string }[],
    department_id: number,
    date: string,
) {
    const results = [];
    const actionType = TransactionType.Return;
    const transaction = () => {
        const updateDepartmentQuery = db.prepare(
            `UPDATE equipmentdepartment
            SET quantity = quantity - $quantity, return_date = $date, after_status = $after_status
            WHERE equipment_id = $id AND department_id = $department_id AND quantity >= $quantity`,
        );

        const updateStorageQuery = db.prepare(
            `UPDATE equipment
            SET quantity = quantity + $quantity, after_status = $after_status
            WHERE id = $id`,
        );

        const insertLogQuery = db.prepare(
            `INSERT INTO actionlog (equipment_id, department_id, quantity, type, date)
            VALUES ($id, $department_id, $quantity, $actionType, $date)`,
        );

        for (const item of items) {
            const updateDepartment = updateDepartmentQuery.run({
                id: item.id,
                department_id,
                quantity: item.quantity,
                date,
                after_status: item.after_status,
            });
            if (updateDepartment.changes === 0) {
                throw new Error('Insufficient quantity');
            }
            const updateStorage = updateStorageQuery.run({
                id: item.id,
                quantity: item.quantity,
                after_status: item.after_status,
            });
            if (updateStorage.changes === 0) {
                throw new Error('Failed to update storage');
            }

            const logResult = insertLogQuery.run({
                id: item.id,
                department_id,
                quantity: item.quantity,
                actionType,
                date,
            });
            if (logResult.changes === 0) {
                throw new Error('Failed to log action');
            }
            results.push(logResult.lastInsertRowid);
        }
    };
    db.transaction(transaction)();
    return results;
}
