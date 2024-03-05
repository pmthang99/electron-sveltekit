import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { app, ipcMain, BrowserWindow } from "electron";
import serve from "electron-serve";
import ws from "electron-window-state";

import("electron-reloader")
  .then((mod) => mod.default(module))
  .catch(console.error);

import LocalStorage from "./electron/localStorage.js";
const localStorage = new LocalStorage({
  configName: "userPreferences",
  defaults: {
    firstRun: true,
  },
});

console.log(localStorage.get("firstRun"));
// TODO: reflag
if (true) {
  import("./electron/db/setup.js")
    .then((setup) => {
      setup.default();
      localStorage.set("firstRun", false);
    })
    .catch(console.error);
}

const loadURL = serve({ directory: "." });
const port = process.env.PORT || 3000;
const isdev = !app.isPackaged || process.env.NODE_ENV == "development";
let mainwindow;

function loadVite(port) {
  mainwindow.loadURL(`http://localhost:${port}`).catch(() => {
    setTimeout(() => {
      loadVite(port);
    }, 200);
  });
}

function createMainWindow() {
  const getSourceDirectory = () =>
    isdev
      ? path.join(process.cwd(), "build", "src") // or wherever your local build is compiled
      : path.join(process.resourcesPath, "app", "src"); // asar location

  let mws = ws({
    defaultWidth: 1000,
    defaultHeight: 800,
  });

  mainwindow = new BrowserWindow({
    x: mws.x,
    y: mws.y,
    width: mws.width,
    height: mws.height,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: isdev || true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  mainwindow.once("close", () => {
    mainwindow = null;
  });

  if (!isdev) mainwindow.removeMenu();
  else mainwindow.webContents.openDevTools();
  mws.manage(mainwindow);

  if (isdev) loadVite(port);
  else loadURL(mainwindow);
}

app.whenReady().then(createMainWindow);
app.on("activate", () => {
  if (!mainwindow) createMainWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
