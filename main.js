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

// Emitted when the app is ready
app.on('ready', () => {
  // For app window position
  let cachedBounds;

  // Initialize tray
  appIcon = new Tray(iconPath);

  // Set app window position
  const windowPosition = (isWindows) ? 'trayBottomCenter' : 'trayCenter';

  function showWindow(trayBounds) {
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
    // Show app window
    appIcon.window.show();
  }

  // Hide app window
  function hideWindow() {
    if (!appIcon.window) return;
    appIcon.window.hide();
  }

  // Initialize context menu
  function initContextMenu() {
    const template = [
      {
        // Show/Hide app window
        label: 'Show/Hide',
        click: () => {
          if (appIcon.window && appIcon.window.isVisible()) hideWindow();
          else {
            showWindow(cachedBounds);
          }
        },
      },
      {
        // Load home page
        label: 'Home',
        click: () => {
          if (!(appIcon.window.webContents.getURL().indexOf('index') > -1)) {
            appIcon.window.loadURL(`file://${appRoot}/app/index.html`);
          }
          showWindow(cachedBounds);
        },
      },
      {
        // Load settings page
        label: 'Settings',
        click: () => {
          if (!(appIcon.window.webContents.getURL().indexOf('settings') > -1)) {
            appIcon.window.loadURL(`file://${appRoot}/app/settings.html`);
          }
          showWindow(cachedBounds);
        },
      },
      {
        // Quit app
        label: 'Quit',
        click: () => {
          app.exit(0);
        },
      },
      { type: 'separator' },
      {
        // Toggle DevTools
        label: 'Toggle DevTools',
        click: () => {
          appIcon.window.toggleDevTools();
        },
      },
    ];
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
    appIcon.window.setVisibleOnAllWorkspaces(true);

    // Load home page
    appIcon.window.loadURL(`file://${appRoot}/app/index.html`);

    // Hide app window on focus out
    appIcon.window.on('blur', hideWindow);
  }

  initAppWindow();

  // Quit
  ipc.on('app-quit', () => {
    app.quit();
  });

  // Load home page
  ipc.on('open-window', () => {
    if (!(appIcon.window.webContents.getURL().indexOf('index') > -1)) {
      appIcon.window.loadURL(`file://${appRoot}/app/index.html`);
    }
  });

  // Load settings page
  ipc.on('open-settings-window', () => {
    appIcon.window.loadURL(`file://${appRoot}/app/settings.html`);
  });

  // Hide app window to notifications bar
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

  //
  appIcon.setToolTip('Habit tracking, github style!');

  // If userName is not present then load settings page
  if (!config.readSettings(constants.userNameKey)) appIcon.window.loadURL(`file://${appRoot}/app/settings.html`);

  // Open app window at start (keep here for debuging)
  // showWindow(cachedBounds);
  // appIcon.window.toggleDevTools();
});
