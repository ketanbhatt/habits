'use strict';

const reqlib = require('app-root-path').require;

const ipc = require('electron').ipcRenderer;
const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

const db = reqlib('nedb.js');

const saveButton = document.querySelector('#saveButton');
const userNameField = document.querySelector('#userNameField');

saveButton.addEventListener('click', () => {
  const name = userNameField.value;
  config.saveSettings(constants.userNameKey, name);
  for (let i = 0; i < 3; i++) {
    const habit = {
      title: document.querySelector(`#habit${i}`).value,
      created_at: 0, // TODO: Need right date here
      fulfillment: document.querySelector(`#habit${i}f`).value,
      _id: `habit${i}`,
    };
    db.habits.insert(habit, (err, newDoc) => {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      console.log(newDoc);
    });
  }
  ipc.send('close-settings-window');
});
