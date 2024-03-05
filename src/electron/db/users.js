import db from "./db.js";

const add = (name, password) => {
  const user = get(name);
  if (user) {
    // Already exists
    return false;
  }

  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
    username,
    password
  );
  return true;
};

const get = (name) => {
  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  return user;
};

export default { get, add };
