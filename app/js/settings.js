'use strict';

const reqlib = require('app-root-path').require;

const ipc = require('electron').ipcRenderer;
const config = reqlib('configuration.js');
const constants = reqlib('constants.js');

// const db = reqlib('nedb.js');

const userNameButton = document.querySelector('#userNameButton');
const userNameField = document.querySelector('#userNameField');

userNameButton.addEventListener('click', () => {
  const name = userNameField.value;
  config.saveSettings(constants.userNameKey, name);
  ipc.send('close-settings-window');
});

// const habit = {
//   title: 'Turn of R',
//   created_at: 0,
//   fulfillment: 2,
//   _id: 'habit4',
// };

// db.habits.insert(habit, (err, newDoc) => {   // Callback is optional
//   // newDoc is the newly inserted document, including its _id
//   // newDoc has no key called notToBeSaved since its value was undefined
//   console.log(newDoc);
// });
