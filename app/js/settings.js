'use strict';

const ipc = require('electron').ipcRenderer;
const config = require('../configuration');  // TODO: Fix this bad way of refrencing
const constants = require('../constants');  // TODO: Fix this bad way of refrencing

const userNameButton = document.querySelector('#userNameButton');
const userNameField = document.querySelector('#userNameField');

userNameButton.addEventListener('click', () => {
  const name = userNameField.value;
  config.saveSettings(constants.userNameKey, name);
  ipc.send('close-settings-window');
});
