import db from "./db.js";

function listInventoryOfTeam(type, team_id, item_id) {
  let sql = `SELECT it.name, iv.* FROM items it INNER JOIN inventory iv WHERE iv.item_id = it.id AND it.type = ? AND iv.team_id IS ?`;
  let params = [type, team_id];
  if (item_id) {
    sql += ` AND iv.item_id = ?`;
    params.push(item_id);
  }
  const stmt = db.prepare(sql);
  return stmt.all(params);
}

export default { listInventoryOfTeam };
