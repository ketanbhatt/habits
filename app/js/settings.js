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

  const habitsList = document.querySelector('#habitsForm').children;
  function storeHabits(msg, callback) {
    // Skip userName, br, saveButton child
    for (let i = 2; i < habitsList.length - 1; i += 2) {
      // console.log(habitsList[i].value);
      const habit = {
        title: habitsList[i].value,
      };
      db.habits.insert(habit, (err, newDoc) => {   // Callback is optional
        // newDoc is the newly inserted document, including its _id
        console.log(newDoc);
      });
    }
    callback(msg);
  }
  storeHabits('close-settings-window', ipc.send);
});
