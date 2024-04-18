import db from "./db.js";

function setup() {
  // Create users table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`
  ).run();

  // Create team table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            is_deleted INTEGER
        )`
  ).run();

  // Create items table to manage different types of items
  db.prepare(
    `CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            type TEXT,
            UNIQUE (type, name)
        )`
  ).run();

  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NULL,
        team_id INTEGER NULL,
        item_id INTEGER NULL,
        quantity INTEGER,
        UNIQUE (code, item_id),
        FOREIGN KEY(team_id) REFERENCES teams(id),
        FOREIGN KEY(item_id) REFERENCES items(id)
    );
`);

  // Create transactions table to record movements of items between people
  db.prepare(
    `CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            code TEXT NULL,
            quantity INTEGER,
            team_id INTEGER,
            transaction_type TEXT,
            date TEXT,
            FOREIGN KEY(item_id) REFERENCES items(id)
            FOREIGN KEY(team_id) REFERENCES teams(id)
        )`
  ).run();
}

// Function to get a list of items per type
function getItemsByType(itemType) {
  const items = db.prepare("SELECT * FROM items WHERE type = ?").all(itemType);
  return items;
}

// Function to list teamanizations
function listteam() {
  const teams = db.prepare("SELECT * FROM teams").all();
  return teams;
}

// Function to move items from one person to another
function moveItems(
  itemId,
  itemName,
  itemQuantity,
  itemType,
  fromPersonId,
  toPersonId
) {
  const item = db
    .prepare(
      "SELECT * FROM items WHERE id = ? OR (name = ? AND type = ? AND id IS NULL AND quantity >= ?) LIMIT 1"
    )
    .get(itemId, itemName, itemType, itemQuantity);
  if (!item) {
    console.log("Item not found or insufficient quantity available");
    return;
  }

  db.transaction(() => {
    if (item.id === null) {
      db.prepare(
        "UPDATE items SET quantity = quantity - ? WHERE name = ? AND type = ?"
      ).run(itemQuantity, itemName, itemType);
    } else {
      db.prepare("DELETE FROM items WHERE id = ?").run(itemId);
    }
    db.prepare(
      "INSERT INTO transactions (item_id, quantity, from_person_id, to_person_id) VALUES (?, ?, ?, ?)"
    ).run(itemId, itemQuantity, fromPersonId, toPersonId);
  })();

  console.log(
    `Moved ${itemQuantity} "${itemName}" of type "${itemType}" from person ${fromPersonId} to person ${toPersonId}`
  );
}

// Function to return items from a person to their original person
function returnItems(
  itemId,
  itemName,
  itemQuantity,
  itemType,
  originalPersonId
) {
  const lastTransaction = db
    .prepare(
      "SELECT * FROM transactions WHERE item_id = ? AND quantity = ? ORDER BY transaction_date DESC LIMIT 1"
    )
    .get(itemId, itemQuantity);
  if (!lastTransaction) {
    console.log("No transaction record found for these items");
    return;
  }

  db.transaction(() => {
    if (itemId === null) {
      db.prepare(
        "UPDATE items SET quantity = quantity + ? WHERE name = ? AND type = ?"
      ).run(itemQuantity, itemName, itemType);
    } else {
      db.prepare(
        "INSERT INTO items (id, name, quantity, type, person_id) VALUES (?, ?, ?, ?, ?)"
      ).run(itemId, itemName, itemQuantity, itemType, originalPersonId);
    }
    db.prepare(
      "UPDATE transactions SET return_date = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(lastTransaction.id);
  })();

  console.log(
    `Returned ${itemQuantity} "${itemName}" of type "${itemType}" to person ${originalPersonId}`
  );
}

export default setup;
