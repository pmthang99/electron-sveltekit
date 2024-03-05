import db from "./db.js";

const listByType = (type) => {
  const items = db.prepare("SELECT * FROM items WHERE type = ?").all(type);
  return items;
};

const loadItemsInStorage = (type) => {
  const items = db
    .prepare(
      "SELECT it.name, iv.* FROM items it INNER JOIN inventory iv WHERE iv.item_id = it.id AND it.type = ? AND iv.team_id IS NULL"
    )
    .all(type);
  return items;
};

function loadItemsOfTeam(team_id, type) {
  const items = db
    .prepare(
      `SELECT DISTINCT it.* FROM items it INNER JOIN inventory iv WHERE iv.item_id = it.id AND it.type = ? AND iv.team_id = ?`
    )
    .all(type, team_id);
  return items;
}

const importItem = (name, code, type, quantity) => {
  db.transaction(() => {
    // Insert new item into items table if it doesn't exist
    db.prepare("INSERT OR IGNORE INTO items (name, type) VALUES (?, ?)").run(
      name,
      type
    );

    // Get the id of the item
    const itemId = db
      .prepare(
        `
      SELECT id FROM items WHERE name = ? AND type = ?
    `
      )
      .get(name, type).id;

    const itemIdInInventory = db
      .prepare("SELECT id FROM inventory WHERE item_id = ? AND code = ?")
      .get(itemId, code);

    if (itemIdInInventory) {
      // Update the quantity of the item
      db.prepare(
        "UPDATE inventory SET quantity = quantity + ? WHERE id = ?"
      ).run(quantity, itemIdInInventory.id);
    } else {
      // Insert the new item into the items table
      db.prepare(
        "INSERT INTO inventory (item_id, code, quantity) VALUES (?, ?, ?)"
      ).run(itemId, code, quantity);
    }
  })();
};

const supplyItem = (item_id, team_id, quantity, date) => {
  const transaction_type = "supply";

  const inventory = db
    .prepare(
      `SELECT * FROM inventory WHERE (
        item_id = ? AND
        team_id IS NULL AND
        code IS NULL
      )`
    )
    .get(item_id);

  let finalResult = [];

  if (inventory) {
    if (inventory.quantity < quantity) {
      console.log("Insufficient quantity available");
      return;
    }

    db.transaction(() => {
      db.prepare(
        `INSERT OR IGNORE INTO inventory (
          item_id, team_id, quantity
        ) VALUES (?, ?, 0)`
      ).run(item_id, team_id);
      db.prepare(
        "UPDATE inventory SET quantity = quantity + ? WHERE item_id = ? AND team_id = ?"
      ).run(quantity, item_id, team_id);
      db.prepare(
        "UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND team_id IS NULL"
      ).run(quantity, item_id);
      let result = db
        .prepare(
          "INSERT INTO transactions (item_id, quantity, team_id, transaction_type, date) VALUES (?, ?, ?, ?, ?)"
        )
        .run(item_id, quantity, team_id, transaction_type, date);

      finalResult.push(result.lastInsertRowid);
    })();
  } else {
    const invens = db
      .prepare(
        `SELECT * FROM inventory WHERE (
        item_id = ? AND
        team_id IS NULL AND
        code IS NOT NULL
        )
        LIMIT ?
      `
      )
      .all(item_id, quantity);

    if (invens.length < quantity) {
      console.log("Insufficient quantity available");
      return;
    }

    db.transaction(() => {
      for (const inv of invens) {
        db.prepare("UPDATE inventory SET team_id = ? WHERE id = ?").run(
          team_id,
          inv.id
        );
        let result = db
          .prepare(
            "INSERT INTO transactions (item_id, code, quantity, team_id, transaction_type, date) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .run(
            item_id,
            inv.code,
            inv.quantity,
            team_id,
            transaction_type,
            date
          );
        finalResult.push(result.lastInsertRowid);
      }
    })();
  }
  return finalResult;
};

const backItem = (item_id, team_id, quantity, date) => {
  const transaction_type = "back";

  const inventory = db
    .prepare(
      `SELECT * FROM inventory WHERE (
        item_id = ? AND
        team_id = ? AND
        code IS NULL
      )`
    )
    .get(item_id, team_id);

  let finalResult = [];

  if (inventory) {
    if (inventory.quantity < quantity) {
      console.log("Insufficient quantity available");
      return;
    }

    db.transaction(() => {
      db.prepare(
        "UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND team_id = ?"
      ).run(quantity, item_id, team_id);
      db.prepare(
        "UPDATE inventory SET quantity = quantity + ? WHERE item_id = ? AND team_id IS NULL"
      ).run(quantity, item_id);
      let result = db
        .prepare(
          "INSERT INTO transactions (item_id, quantity, team_id, transaction_type, date) VALUES (?, ?, ?, ?, ?)"
        )
        .run(item_id, quantity, team_id, transaction_type, date);

      finalResult.push(result.lastInsertRowid);
    })();
  } else {
    console.log(item_id, quantity, team_id, date);
    const invens = db
      .prepare(
        `SELECT * FROM inventory WHERE (
        item_id = ? AND
        team_id = ? AND
        code IS NOT NULL
        )
        LIMIT ?
      `
      )
      .all(item_id, team_id, quantity);

    if (invens.length < quantity) {
      console.log("Insufficient quantity available");
      return;
    }

    db.transaction(() => {
      for (const inv of invens) {
        db.prepare("UPDATE inventory SET team_id = NULL WHERE id = ?").run(
          inv.id
        );
        let result = db
          .prepare(
            "INSERT INTO transactions (item_id, code, quantity, team_id, transaction_type, date) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .run(
            item_id,
            inv.code,
            inv.quantity,
            team_id,
            transaction_type,
            date
          );
        finalResult.push(result.lastInsertRowid);
      }
    })();
  }
  return finalResult;
};

export default {
  listByType,
  loadItemsInStorage,
  loadItemsOfTeam,
  importItem,
  supplyItem,
  backItem,
};
