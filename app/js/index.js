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

const settingsEl = document.querySelector('.settings');
settingsEl.addEventListener('click', () => {
  ipc.send('open-settings-window');
});

const habitsTableBody = document.querySelector('#habitsTable tbody');

function displayHabits(callback) {
  db.habits.find({}, (err, habits) => {
    let tableRowHTML = '';
    for (let i = 0, len = habits.length; i < len; i++) {
      const rowHabit = `<td>${habits[i].title}</td>`;
      const rowID = `<td><button class="commitButton" value=${habits[i]._id}>+</button></td>`;
      tableRowHTML += `<tr>${rowHabit}${rowID}</tr>`;
    }
    habitsTableBody.innerHTML = tableRowHTML;
    callback();
  });
}

function getCurrentDate() {
  const dt = new Date();
  const epochDt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12).getTime();
  // Convert to seconds
  const currentDate = Math.floor(epochDt / 1000);
  return currentDate;
}

function addCommitButton() {
  const commitButtons = document.getElementsByClassName('commitButton');
  for (let i = 0; i < commitButtons.length; i++) {
    commitButtons[i].addEventListener('click', () => {
      const currentDate = getCurrentDate();

      // Get the commit for the day
      db.commits.find({ date: currentDate }, (err, commit) => {
        if (commit.length === 0) {
          // Init a commit for the day
          // console.log('init');
          const newCommit = {
            date: currentDate,
            commits: {},
          };
          db.habits.find({}, (_err, habits) => {
            for (let j = 0; j < habits.length; j++) {
              newCommit.commits[habits[j]._id] = 0;
            }
            newCommit.commits[commitButtons[i].value] += 1;

            db.commits.insert(newCommit, (__err, newDoc) => {
              console.log(newDoc);
            });
          });
        } else {
          // Update the commit for the day
          // console.log('update');
          const newCommit = commit[0];
          newCommit.commits[commitButtons[i].value] += 1;

          db.commits.update({ _id: commit[0]._id }, newCommit, {}, (_err, numReplaced) => {
            console.log(numReplaced);
          });
        }
      });
    });
  }
}

displayHabits(addCommitButton);

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

