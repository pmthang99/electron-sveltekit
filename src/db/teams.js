import db from "./db.js";

const list = () => {
  try {
    const query = db.prepare("SELECT * FROM teams WHERE is_deleted = 0");
    const rowList = query.all();
    return rowList;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

function add(name) {
  try {
    const insert = db.prepare(
      `INSERT INTO teams (name, is_deleted) VALUES (?, 0)
    ON CONFLICT(name) DO UPDATE SET is_deleted = 0`
    );
    const transaction = db.transaction(() => {
      const info = insert.run(name);
      console.log(
        `Inserted ${info.changes} rows with ID ${info.lastInsertRowid}`
      );
    });
    transaction();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

function remove(id) {
  try {
    const query = db.prepare("UPDATE teams SET is_deleted = 1 WHERE id = ?");
    const transaction = db.transaction(() => {
      const info = query.run(id);
    });
    transaction();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export default { list, add, remove };
