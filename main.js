'use strict';

const appRoot = require('app-root-path');
const reqlib = appRoot.require;

const electron = require('electron');

const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipc = electron.ipcMain;
const Menu = require('menu');
const Tray = require('tray');

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

const trayIconPath = `${appRoot}/app/icons/tray.png`;
let appTray = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let homeWindow = null;
let settingsWindow = null;

function openSettings() {
  if (settingsWindow) return;

  // Create the browser window.
  settingsWindow = new BrowserWindow({
    width: 270,
    height: 400,
  });

  // and load the index.html of the app.
  settingsWindow.loadURL(`file://${appRoot}/app/settings.html`);

  // settingsWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function openHome() {
  // Create the browser window.
  homeWindow = new BrowserWindow({
    alwaysOnTop: true,
    frame: false,
    movable: false, // only OS X
    resizable: false, // FIXME: not working
    show: true,
    title: 'Habits',
    height: 600,
    width: 400,
    x: 9999, // FIXME: used to get right most position
    y: 0,
  });

  // Load the index.html of the app.
  homeWindow.loadURL(`file://${appRoot}/app/index.html`);

  // Open the DevTools.
  // homeWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  homeWindow.on('closed', () => {
    // Dereference the window object
    homeWindow = null;
  });

  // Emitted when the window loses focus.
  homeWindow.on('blur', () => {
    // If Settings is being opened, keep Home
    if (settingsWindow) homeWindow.show();
    // Hide the window
    else homeWindow.hide();
  });

  // Create the tray icon
  appTray = new Tray(trayIconPath);

  // Create the context menu for tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Window',
      click: () => {
        if (homeWindow.isVisible()) homeWindow.hide();
        else {
          homeWindow.show();
          homeWindow.focus();
        }
      },
    },
    {
      label: 'Toggle DevTools',
      click: () => {
        homeWindow.toggleDevTools();
      },
    },
    { type: 'separator' },
    { label: 'Quit',
      click: () => {
        app.exit(0);
      },
    },
  ]);

  // Configure tray
  appTray.setToolTip('Habits');
  appTray.setContextMenu(contextMenu);

  // Focus on Home
  homeWindow.focus();

  // If userName is not present then open Settings
  if (!config.readSettings(constants.userNameKey)) openSettings();
}

ipc.on('open-settings-window', () => {
  if (settingsWindow === null) {
    openSettings();
  }
});

ipc.on('close-settings-window', () => {
  if (settingsWindow) {
    // Reload Home to reflect changes
    if (homeWindow) homeWindow.reload();
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
  openHome();
});
