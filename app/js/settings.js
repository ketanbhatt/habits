'use strict';

const reqlib = require('app-root-path').require;

const ipc = require('electron').ipcRenderer;
const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

const db = reqlib('nedb.js');

// Open home window button
const homeEl = document.querySelector('.home');
homeEl.addEventListener('click', () => {
  ipc.send('open-window');
});

// Hide app window to notifications bar button
const hideEl = document.querySelector('.hide');
hideEl.addEventListener('click', () => {
  ipc.send('hide-window');
});

const saveButton = document.querySelector('#saveButton');
saveButton.addEventListener('click', () => {
  const userNameField = document.querySelector('#userNameField');
  const name = userNameField.value;
  config.saveSettings(constants.userNameKey, name);

  const habitsList = document.querySelector('#habitsForm').getElementsByTagName('input');
  function storeHabits(msg, callback) {
    // i = 1 to skip userName field
    for (let i = 1; i < habitsList.length; i += 1) {
      const habit = {
        title: habitsList[i].value,
      };
      db.habits.insert(habit);
    }
    callback(msg);
  }
  storeHabits('open-window', ipc.send);
});
