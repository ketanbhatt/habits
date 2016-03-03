'use strict';

const reqlib = require('app-root-path').require;

const ipc = require('electron').ipcRenderer;
const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

const db = reqlib('nedb.js');

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
      db.habits.insert(habit, (err, newDoc) => {
        // newDoc is the newly inserted document, including its _id
        console.log(newDoc);
      });
    }
    callback(msg);
  }
  storeHabits('close-settings-window', ipc.send);
});

const closeEl = document.querySelector('.close');
closeEl.addEventListener('click', () => {
  ipc.send('close-settings-window');
});
