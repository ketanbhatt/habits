'use strict';

const reqlib = require('app-root-path').require;

const ipc = require('electron').ipcRenderer;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');
const db = reqlib('nedb.js');

const userName = document.querySelector('#userName');
userName.innerHTML = config.readSettings(constants.userNameKey);

const settingsEl = document.querySelector('.settings');
settingsEl.addEventListener('click', () => {
  ipc.send('open-settings-window');
});

db.habits.count({}, (err, count) => {
  console.log(count);
});
