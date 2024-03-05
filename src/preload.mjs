import { contextBridge } from "electron";
import items from "./electron/db/items.js";
import teams from "./electron/db/teams.js";
import users from "./electron/db/users.js";
import inventory from "./electron/db/inventory.js";
import transactions from "./electron/db/transactions.js";

export const dbContext = {
  items,
  teams,
  users,
  inventory,
  transactions,
};

contextBridge.exposeInMainWorld("db", dbContext);
