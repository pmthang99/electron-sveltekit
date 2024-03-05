import database from "better-sqlite3";
import { join } from "path";

const dbPath =
  process.env.NODE_ENV === "development"
    ? "./demo_db.db"
    : join(process.resourcesPath, "./database.db");

const db = new database(dbPath);
db.pragma("journal_mode = WAL");

export default db;
