const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("BossFightConfig", {
  serverUrl: process.env.BOSS_FIGHT_SERVER_URL || "",
  isDesktop: true,
});

contextBridge.exposeInMainWorld("BossFightUpdater", {
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  onStatus: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("updates:status", listener);
    return () => ipcRenderer.removeListener("updates:status", listener);
  },
});
