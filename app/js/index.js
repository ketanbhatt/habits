'use strict';

const reqlib = require('app-root-path').require;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');
const db = reqlib('nedb.js');

const userName = document.querySelector('#userName');
userName.innerHTML = config.readSettings(constants.userNameKey);

const habitsTable = document.querySelector('#habitsTable');
function display(inputDate) {
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
        db.commits.insert(commit, () => {
          // Display for the date
          for (let i = 0; i < count; i++) {
            db.habits.find({ _id: `habit${i}` }, (__err, habits) => {
              // console.log(habit);
              const tr = `<tr><td>${habits[0].title}</td>` +
              `<td>${habits[0].fulfillment}</td>` +
              '<td >0</td></tr>';
              // `<td id=${habits[0]._id}>0</td></tr>`;
              habitsTable.innerHTML += tr;
            });
          }
        });
      });
    } else {
      // Commit for the date is present
      const doc = docs[0];
      // Display for the date
      for (let i = 0; i < doc.commits.length; i++) {
        db.habits.find({ _id: doc.commits[i].habit }, (_err, habits) => {
          // console.log(habit);
          const tr = `<tr><td>${habits[0].title}</td>` +
          `<td>${habits[0].fulfillment}</td>` +
          `<td>${doc.commits[i].count}</td></tr>`;
          // `<td id=${habits[0]._id}>${doc.commits[i].count}</td></tr>`;
          habitsTable.innerHTML += tr;
        });
      }
    }
  });
}

const inputDate = Date().slice(0, 15);
display(inputDate);
