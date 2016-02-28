'use strict';

const reqlib = require('app-root-path').require;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');
const db = reqlib('nedb.js');

const userName = document.querySelector('#userName');
userName.innerHTML = config.readSettings(constants.userNameKey);


function displayHabits(inputDate, callback) {
  const habitsTable = document.createElement('table');
  const habitsTableRow = document.createElement('tr');
  const habitsTableHead1 = document.createElement('th');
  const habitsTableHead1Value = document.createTextNode('Habit');
  const habitsTableHead2 = document.createElement('th');
  const habitsTableHead2Value = document.createTextNode('Fulfillment');
  const habitsTableHead3 = document.createElement('th');
  const habitsTableHead3Value = document.createTextNode('Count');

  habitsTable.appendChild(habitsTableRow);
  habitsTableRow.appendChild(habitsTableHead1);
  habitsTableRow.appendChild(habitsTableHead2);
  habitsTableRow.appendChild(habitsTableHead3);
  habitsTableHead1.appendChild(habitsTableHead1Value);
  habitsTableHead2.appendChild(habitsTableHead2Value);
  habitsTableHead3.appendChild(habitsTableHead3Value);

  db.habits.count({}, (err, count) => {
    // console.log(count);
    db.habits.find({}, (_err, habits) => {
      // console.log(habits);

      for (let i = 0; i < count; i++) {
        const habitsTR = document.createElement('tr');
        const habitsTD1 = document.createElement('td');
        const habitsTD2 = document.createElement('td');
        const habitsTD3 = document.createElement('td');
        habitsTD3.id = habits[i]._id;
        const habitsTD1V = document.createTextNode(`${habits[i].title}`);
        const habitsTD2V = document.createTextNode(`${habits[i].fulfillment}`);
        const habitsTD3V = document.createTextNode(0);

        habitsTR.appendChild(habitsTD1);
        habitsTR.appendChild(habitsTD2);
        habitsTR.appendChild(habitsTD3);
        habitsTD1.appendChild(habitsTD1V);
        habitsTD2.appendChild(habitsTD2V);
        habitsTD3.appendChild(habitsTD3V);
        habitsTable.appendChild(habitsTR);
      }
      callback(inputDate);
    });
  });

  const habitsDiv = document.querySelector('#habits');
  habitsDiv.appendChild(habitsTable);
}

function displayCount(inputDate) {
  db.commits.find({ date: inputDate }, (err, docs) => {
    if (docs.length === 0) {
      // If no commit is present for the date
      db.habits.count({}, (_err, count) => {
        const commit = {
          date: inputDate,
          commits: [],
        };
        // ID for Habit is of format 'habit0'
        for (let i = 0; i < count; i++) {
          commit.commits.push({ habit: `habit${i}`, count: 0 });
        }
        // Add a new commit to the db for the date
        db.commits.insert(commit, (__err, newDoc) => {
          // Callback
          console.log(newDoc);
        });
      });
    } else {
      // Commit for the date is present
      const doc = docs[0];
      for (let i = 0; i < doc.commits.length; i++) {
        const hb = document.querySelector(`#${doc.commits[i].habit}`);
        hb.innerHTML = doc.commits[i].count;
      }
    }
  });
}

const inputDate = 1;  // TODO: Have to figure out a way to represent date
displayHabits(inputDate, displayCount);
