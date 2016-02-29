'use strict';

const appRoot = require('app-root-path');
const reqlib = appRoot.require;

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipc = electron.ipcMain;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let settingsWindow = null;

function openHome() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${appRoot}/app/index.html`);

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
  settingsWindow.loadURL(`file://${appRoot}/app/settings.html`);

  settingsWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

ipc.on('open-settings-window', () => {
  if (settingsWindow === null) {
    openSettings();
  }
});

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
  if (!config.readSettings(constants.userNameKey)) openSettings();
  else openHome();
});
