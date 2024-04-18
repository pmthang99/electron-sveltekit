"use strict";

import db from "./db.js";

function viewByIds(ids) {
  const sql = `SELECT items.name, txn.* FROM transactions txn INNER JOIN items WHERE txn.id = ? AND txn.item_id = items.id`;
  const stmt = db.prepare(sql);
  const myTransaction = db.transaction((id) => {
    return id.map((x) => stmt.get(x));
  });
  return myTransaction(ids);
}

function view(team_id, type) {
  const sql = `SELECT items.name, txn.* FROM transactions txn INNER JOIN items WHERE txn.team_id = ? AND txn.type = ? AND txn.item_id = items.id`;
  const stmt = db.prepare(sql);
  return stmt.all(team_id, type);
}

export default { viewByIds };
