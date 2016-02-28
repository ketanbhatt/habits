'use strict';

const reqlib = require('app-root-path').require;

const ipc = require('electron').ipcRenderer;
const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

const userNameButton = document.querySelector('#userNameButton');
const userNameField = document.querySelector('#userNameField');

userNameButton.addEventListener('click', () => {
  const name = userNameField.value;
  config.saveSettings(constants.userNameKey, name);
  ipc.send('close-settings-window');
});
