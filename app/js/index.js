'use strict';
/* globals CalHeatMap */

const reqlib = require('app-root-path').require;

const ipc = require('electron').ipcRenderer;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');
const db = reqlib('nedb.js');
const chartHelper = reqlib('app/js/chart.js');

const cal = new CalHeatMap();
const userName = document.querySelector('#userName');
userName.innerHTML = config.readSettings(constants.userNameKey);

// Open settings window button
const settingsEl = document.querySelector('.settings');
settingsEl.addEventListener('click', () => {
  ipc.send('open-settings-window');
});

// Hide app window to notifications bar button
const hideEl = document.querySelector('.hide');
hideEl.addEventListener('click', () => {
  ipc.send('hide-window');
});

const habitsTableBody = document.querySelector('#habitsTable tbody');

function displayHabits(callback) {
  // Look up all habits
  db.habits.find({}, (errHabits, habits) => {
    let tableRowHTML = '';
    for (let i = 0, len = habits.length; i < len; i++) {
      // Make HTML row for the habit to display
      const divisionHabit = `<td>${habits[i].title}</td>`;
      const divisionCommitButton = '<td><button class="commitButton icon icon-plus" ' +
        `value=${habits[i]._id}></button></td>`;
      tableRowHTML += `<tr>${divisionHabit}${divisionCommitButton}</tr>`;
    }
    // Add the habit row to the html table
    habitsTableBody.innerHTML = tableRowHTML;
    // Callback to addCommitButtonListeners
    callback();
  });
}

function getCurrentDayEpoch() {
  // Return current day time epoch in seconds
  const now = new Date();
  let currentDayEpoch = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  currentDayEpoch = Math.floor(currentDayEpoch / 1000);
  return currentDayEpoch;
}

function addCommitButtonListeners() {
  //  Get all commit buttons from the html
  const commitButtons = document.getElementsByClassName('commitButton');
  // Add cick listener for each commit button
  for (let i = 0; i < commitButtons.length; i++) {
    commitButtons[i].addEventListener('click', () => {
      // Get current day's  time epoch in seconds
      const currentDayEpoch = getCurrentDayEpoch();

      // Db update query
      const updateCom = { $inc: {} };
      updateCom.$inc[`commits.${commitButtons[i].value}`] = 1;
      // Try to increment the commit count for the habit
      db.commits.update(
        { date: currentDayEpoch },
        updateCom,
        (errCommitsUpdate, numReplaced) => {
          // If no doc is updated, init a commit for the day
          if (numReplaced === 0) {
            const newCommit = {
              date: currentDayEpoch,
              commits: {},
            };
            // Look up all habits to insert `id: count` in the commit
            db.habits.find({}, (errHabitsFind, habits) => {
              for (let j = 0; j < habits.length; j++) {
                newCommit.commits[habits[j]._id] = 0;
              }
              newCommit.commits[commitButtons[i].value] += 1;

              // Insert the commit in the db
              db.commits.insert(newCommit);
            });
          }
        });
    });
  }
}

displayHabits(addCommitButtonListeners);

// Create chart
chartHelper.getCommitLogForCurrentMonth((data) => {
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
});
