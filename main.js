'use strict';

const appRoot = require('app-root-path');
const reqlib = appRoot.require;

const electron = require('electron');

const app = electron.app;  // Module to control application life
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window
const ipc = electron.ipcMain;
const Menu = require('menu');
const Tray = require('tray');

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let homeWindow = null;
let settingsWindow = null;
let appTray = null;

function openSettings() {
  if (settingsWindow) {
    settingsWindow.focus();
  } else {
    // Create the Settings window
    settingsWindow = new BrowserWindow({
      alwaysOnTop: true,
      frame: false,
      height: 400,
      width: 270,
    });

    // Load the index.html of the app
    settingsWindow.loadURL(`file://${appRoot}/app/settings.html`);
    settingsWindow.focus();

    // settingsWindow.webContents.openDevTools();

    // Emitted when the window is closed
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  }
}

function openHome() {
  const electronScreen = electron.screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  const windowWidth = 350;
  const windowHeight = 550;

  // Create the Home window
  homeWindow = new BrowserWindow({
    alwaysOnTop: true,
    frame: false,
    movable: false, // only OS X
    resizable: false, // FIXME: not working
    show: true,
    title: 'Habits',
    height: windowHeight,
    width: windowWidth,
    x: size.width - windowWidth / 2,
    y: 0,
  });

  // Load the index.html of the app.
  homeWindow.loadURL(`file://${appRoot}/app/index.html`);

  // Focus on Home
  homeWindow.focus();

  // Open the DevTools.
  // homeWindow.webContents.openDevTools();

  // Emitted when the window is closed
  homeWindow.on('closed', () => {
    // Dereference the window object
    homeWindow = null;
  });

  // Emitted when the window loses focus
  homeWindow.on('blur', () => {
    // If Settings is being opened, keep Home
    if (settingsWindow) homeWindow.show();
    // Hide the window
    else homeWindow.hide();
  });

  // Create the tray icon
  let iconPath = null;
  if (process.platform === 'win32') iconPath = `${appRoot}/app/icons/tray.ico`;
  else if (process.platform === 'darwin') iconPath = `${appRoot}/app/icons/tray.icns`;
  else iconPath = `${appRoot}/app/icons/tray.png`;
  appTray = new Tray(iconPath);

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
      label: 'Open Settings',
      click: () => {
        openSettings();
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

  // If userName is not present then open Settings
  if (!config.readSettings(constants.userNameKey)) openSettings();
}

ipc.on('open-settings-window', () => {
  openSettings();
});

ipc.on('close-settings-window', () => {
  if (settingsWindow) {
    // Bring Home up
    if (!homeWindow.isVisible()) homeWindow.show();
    // Reload Home to reflect changes
    homeWindow.reload();
    // Close Settings
    settingsWindow.close();
  }
});

ipc.on('hide-home-window', () => {
  if (homeWindow) {
    // Hide Home
    homeWindow.hide();
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
