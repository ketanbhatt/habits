'use strict';

const appRoot = require('app-root-path');
const reqlib = appRoot.require;

const electron = require('electron');
const app = electron.app;  // Module to control application life
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window
const ipc = electron.ipcMain;

const Menu = require('menu');
const Positioner = require('electron-positioner');
const Tray = require('tray');

// User config
const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

// Utilities
const isDarwin = (process.platform === 'darwin'); // OS X
const isLinux = (process.platform === 'linux');
const isWindows = (process.platform === 'win32');

// Tray icon path
let iconPath = null;
if (isWindows) iconPath = `${appRoot}/app/icons/tray.ico`;
else iconPath = `${appRoot}/app/icons/tray.png`;

// Keep a global reference of the window object
let appIcon = null;
let settingsWindow = null;

// Emitted when the app is ready
app.on('ready', () => {
  let cachedBounds;
  appIcon = new Tray(iconPath);
  const windowPosition = (isWindows) ? 'trayBottomCenter' : 'trayCenter';

  function showWindow(trayBounds, view) {
    let noBoundsPosition;

    // Calculate variables for right position of app window
    if (!isDarwin && trayBounds !== undefined) {
      const displaySize = electron.screen.getPrimaryDisplay().workAreaSize;
      let trayBoundsX = trayBounds.x;
      let trayBoundsY = trayBounds.y;

      if (isLinux) {
        const cursorPointer = electron.screen.getCursorScreenPoint();
        trayBoundsX = cursorPointer.x;
        trayBoundsY = cursorPointer.y;
      }

      const x = (trayBoundsX < (displaySize.width / 2)) ? 'left' : 'right';
      const y = (trayBoundsY < (displaySize.height / 2)) ? 'top' : 'bottom';

      if (x === 'right' && y === 'bottom') {
        noBoundsPosition = (isWindows) ? 'trayBottomCenter' : 'bottomRight';
      } else if (x === 'left' && y === 'bottom') {
        noBoundsPosition = 'bottomLeft';
      } else if (y === 'top') {
        noBoundsPosition = (isWindows) ? 'trayCenter' : 'topRight';
      }
    } else if (trayBounds === undefined) {
      noBoundsPosition = (isWindows) ? 'bottomRight' : 'topRight';
    }

    // Calculate position for app window
    const position = appIcon.positioner.calculate(noBoundsPosition || windowPosition, trayBounds);
    appIcon.window.setPosition(position.x, position.y);
    if (view && view === 'inactive') appIcon.window.showInactive();
    else appIcon.window.show();
  }

  // Hide app window
  function hideWindow() {
    if (!appIcon.window) return;
    appIcon.window.hide();
  }

    // Create, configure and load settings window
  function openSettings() {
    // Show app window
    showWindow(cachedBounds, 'inactive');

    // If settings is already open, bring to front
    if (settingsWindow) {
      settingsWindow.show();
    } else {
      // Create the settings window
      settingsWindow = new BrowserWindow({
        frame: false,
        height: 400,
        width: 270,
      });

      // Load the index.html of the app
      settingsWindow.loadURL(`file://${appRoot}/app/settings.html`);

      // settingsWindow.webContents.openDevTools();

      // Emitted when the window is closed
      settingsWindow.on('closed', () => {
        settingsWindow = null;

        // Relfect changes on app window
        appIcon.window.reload();
        // Open app window
        showWindow();
      });

      // Emitted when the window looses focus
      settingsWindow.on('blur', () => {
        // Hide app window
        hideWindow();
      });

      // Emitted when the window gets focus
      settingsWindow.on('focus', () => {
        // Show app window
        showWindow(cachedBounds, 'inactive');
      });
    }
  }

  // Initialize context menu
  function initContextMenu() {
    const template = [
      {
        label: 'Toggle Window',
        click: () => {
          if (appIcon.window && appIcon.window.isVisible()) hideWindow();
          else {
            showWindow(cachedBounds);
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
          appIcon.window.toggleDevTools();
        },
      },
      { type: 'separator' },
      { label: 'Quit',
        click: () => {
          app.exit(0);
        },
    }];
    const contextMenu = Menu.buildFromTemplate(template);
    return contextMenu;
  }

  // Initialize app window
  function initAppWindow() {
    let windowType = '';
    if (isLinux) windowType = 'splash';
    else windowType = 'normal';

    // App window config
    const defaults = {
      width: 400,
      height: 350,
      alwaysOnTop: true,
      frame: false,
      show: false,
      title: 'Habits',
      type: windowType,
      webPreferences: {
        overlayScrollbars: true,
        preload: true,
      },
    };

    const contextMenu = initContextMenu();

    // Set context menu for Linux
    if (isLinux) appIcon.setContextMenu(contextMenu);
    // Set click events for OS X, Windows
    else {
      // Display or hide app window
      appIcon.on('click', (e, bounds) => {
        if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) hideWindow();
        if (appIcon.window && appIcon.window.isVisible()) hideWindow();
        cachedBounds = bounds || cachedBounds;
        showWindow(cachedBounds);
      });
      // Display context menu
      appIcon.on('right-click', () => {
        appIcon.popUpContextMenu(contextMenu);
      });
    }

    // App icon config
    appIcon.window = new BrowserWindow(defaults);
    appIcon.positioner = new Positioner(appIcon.window);
    appIcon.window.loadURL(`file://${appRoot}/app/index.html`);
    appIcon.window.setVisibleOnAllWorkspaces(true);

    // Hide app window on focus out
    appIcon.window.on('blur', () => {
      if (!settingsWindow) hideWindow();
    });
  }

  initAppWindow();

  // Quit
  ipc.on('app-quit', () => {
    app.quit();
  });

  // Reopen app window after saving settings
  ipc.on('reopen-window', () => {
    showWindow(cachedBounds);
  });

  // Hide Home to notifications bar
  ipc.on('hide-window', () => {
    hideWindow();
  });

  // TODO: Implement
  // Update app icon
  // ipc.on('update-icon', function(event, arg) {
  //   if (arg === 'TrayActive') {
  //     appIcon.setImage(iconActive);
  //   } else {
  //     appIcon.setImage(iconIdle);
  //   }
  // });

  // Open settings window
  ipc.on('open-settings-window', () => {
    openSettings();
  });

  // Close settings window
  ipc.on('close-settings-window', () => {
    if (settingsWindow) {
      settingsWindow.close();
    }
  });

  appIcon.setToolTip('Habits');

  // TODO: Implement
  // Show a dialog box
  // const dialog = require('dialog');
  // dialog.showMessageBox({
  //   type: 'info',
  //   buttons: ['Close'],
  //   title: 'Yo',
  //   message: 'Welcome',
  // });

  // TODO : Implement
  // Send a notification
  // npm install --save node-notifier
  // const notifier = require('node-notifier');
  // notifier.notify({
  //   title: 'Yo',
  //   message: 'welcome',
  // });

  // If userName is not present then open settings
  if (!config.readSettings(constants.userNameKey)) openSettings();

  // Open app window at start
  // showWindow();
});
