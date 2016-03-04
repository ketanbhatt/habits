'use strict';
/* globals CalHeatMap */

const reqlib = require('app-root-path').require;

const ipc = require('electron').ipcRenderer;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');
const db = reqlib('nedb.js');

const cal = new CalHeatMap();
const userName = document.querySelector('#userName');
userName.innerHTML = config.readSettings(constants.userNameKey);

// Open settings window button
const settingsEl = document.querySelector('.settings');
settingsEl.addEventListener('click', () => {
  ipc.send('open-settings-window');
});

// Hide to notifications bar button
const hideEl = document.querySelector('.hide');
hideEl.addEventListener('click', () => {
  ipc.send('hide-window');
});

// TODO: uncomment
const habitsTableBody = document.querySelector('#habitsTable tbody');

function display() {
  db.habits.find({}, (err, habits) => {
    let tableRowHTML = '';
    for (let i = 0, len = habits.length; i < len; i++) {
      const rowHabit = `<td>${habits[i].title}</td>`;
      const rowID = `<td>${habits[i]._id}</td>`;
      tableRowHTML += `<tr>${rowHabit}${rowID}</tr>`;
    }
    habitsTableBody.innerHTML = tableRowHTML;
  });
}

//  function getCurrentDate() {
//  const dt = new Date();
//  const epochDt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12).getTime();
//  // Convert to seconds
//  const currentDate = Math.floor(epochDt / 1000);
//  return currentDate;
//  }

display();

const data = {
  1456380083: 13,
  1456682083: 24,
  1457482083: 1,
  1459680083: 5,
};

cal.init({
  domain: 'month',
  subDomain: 'day',
  range: 1,
  tooltip: true,
  cellSize: 20,
  data,
  highlight: ['now'],
  itemName: 'commit',
  subDomainTitleFormat: {
    empty: ':( Nothing on {date}',
  },
});
