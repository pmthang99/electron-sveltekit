import electron from "electron";
const { app, remote } = electron;

import { join } from "path";
import { writeFileSync, readFileSync } from "fs";

class LocalStorage {
  constructor(opts) {
    const userDataPath = (app || remote.app).getPath("userData");
    console.log(userDataPath);
    this.path = join(userDataPath, opts.configName + ".json");
    this.data = this.parseDataFile(this.path, opts.defaults);
  }

  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;

    writeFileSync(this.path, JSON.stringify(this.data));
  }

  parseDataFile = (filePath, defaults) => {
    try {
      return JSON.parse(readFileSync(filePath));
    } catch (err) {
      return defaults;
    }
  };
}

export default LocalStorage;
