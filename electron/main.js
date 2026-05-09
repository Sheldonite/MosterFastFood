const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let mainWindow = null;
let updateCheckInFlight = false;

autoUpdater.autoDownload = false;

function sendUpdateStatus(status) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("updates:status", status);
}

async function checkForUpdates({ manual = false } = {}) {
  if (!app.isPackaged) {
    const status = { state: "idle", message: "Updates are available in packaged builds." };
    if (manual) sendUpdateStatus(status);
    return status;
  }
  if (updateCheckInFlight) {
    return { state: "checking", message: "Already checking for updates." };
  }

  updateCheckInFlight = true;
  sendUpdateStatus({ state: "checking", message: "Checking for updates..." });

  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      state: "checked",
      message: result?.updateInfo?.version ? `Latest version: ${result.updateInfo.version}` : "Update check complete.",
    };
  } catch (error) {
    const status = { state: "error", message: "Update check failed.", detail: error.message };
    sendUpdateStatus(status);
    return status;
  } finally {
    updateCheckInFlight = false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#16130f",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  mainWindow.webContents.once("did-finish-load", () => {
    setTimeout(() => checkForUpdates(), 2500);
  });
}

autoUpdater.on("checking-for-update", () => {
  sendUpdateStatus({ state: "checking", message: "Checking for updates..." });
});

autoUpdater.on("update-not-available", () => {
  sendUpdateStatus({ state: "current", message: "Game is up to date." });
});

autoUpdater.on("update-available", async (info) => {
  sendUpdateStatus({ state: "available", message: `Version ${info.version} is available.` });
  const result = await dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["Download", "Later"],
    defaultId: 0,
    cancelId: 1,
    title: "Update Available",
    message: `Boss Fight ${info.version} is available.`,
    detail: "Download it now? The update will install after the download finishes.",
  });
  if (result.response === 0) {
    sendUpdateStatus({ state: "downloading", message: "Downloading update..." });
    autoUpdater.downloadUpdate();
  }
});

autoUpdater.on("download-progress", (progress) => {
  sendUpdateStatus({
    state: "downloading",
    message: `Downloading update ${Math.round(progress.percent)}%...`,
    percent: progress.percent,
  });
});

autoUpdater.on("update-downloaded", async (info) => {
  sendUpdateStatus({ state: "downloaded", message: `Version ${info.version} is ready to install.` });
  const result = await dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["Restart Now", "Later"],
    defaultId: 0,
    cancelId: 1,
    title: "Update Ready",
    message: `Boss Fight ${info.version} is ready.`,
    detail: "Restart now to install the update.",
  });
  if (result.response === 0) autoUpdater.quitAndInstall();
});

autoUpdater.on("error", (error) => {
  sendUpdateStatus({ state: "error", message: "Update error.", detail: error.message });
});

ipcMain.handle("updates:check", () => checkForUpdates({ manual: true }));

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
