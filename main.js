'use strict';

const electron = require('electron');

const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipc = electron.ipcMain;

const config = require('./configuration');  // TODO: Fix this bad way of refrencing
const constants = require('./constants');  // TODO: Fix this bad way of refrencing

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let settingsWindow = null;
const dirName = __dirname;

function openHome() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${dirName}/app/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function openSettings() {
  if (settingsWindow) return;

  // Create the browser window.
  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  settingsWindow.loadURL(`file://${dirName}/app/settings.html`);

  settingsWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

ipc.on('close-settings-window', () => {
  if (settingsWindow) {
    // Redraw Home
    if (mainWindow) mainWindow.close();
    openHome();

    // Close Settings
    settingsWindow.close();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // If userName is not present then open Settings else open Home
  if (!config.readSettings(constants.userNameKey)) {
    openSettings();
  } else openHome();
});
