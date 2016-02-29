'use strict';

const reqlib = require('app-root-path').require;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');
const db = reqlib('nedb.js');

const userName = document.querySelector('#userName');
userName.innerHTML = config.readSettings(constants.userNameKey);

// TODO: uncomment
// const habitsTable = document.querySelector('#habitsTable');
function display(inputDate) {
  db.commits.find({ date: inputDate }, (err, docs) => {
    if (docs.length === 0) {
      // If no commit is present for the date
      db.habits.find({}, (_err, habits) => {
        const commit = {
          date: inputDate,
          commits: {},
        };

        // Init commits for to habit with count as 0
        for (let i = 0; i < habits.length; i++) {
          commit.commits[habits[`${i}`]._id] = 0;
        }

        // Add the new commit to the db for the date
        db.commits.insert(commit, () => {
          // TODO : Display for the date
          // for (let i = 0; i < commit.commits.length; i++) {
          //   db.habits.find({ _id: `habit${i}` }, (__err, habits) => {
          //     // console.log(habit);
          //     const tr = `<tr><td>${habits[0].title}</td>` +
          //     `<td>${habits[0].fulfillment}</td>` +
          //     '<td>0</td></tr>';
          //     // `<td id=${habits[0]._id}>0</td></tr>`;
          //     habitsTable.innerHTML += tr;
          //   });
          // }
        });
      });
    } else {
      // Commit for the date is present
      const doc = docs[0];
      console.log(doc);
      // TODO : Display for the date
      // for (let i = 0; i < doc.commits.length; i++) {
      //   db.habits.find({ _id: doc.commits[i].habit }, (_err, habits) => {
      //     // console.log(habit);
      //     const tr = `<tr><td>${habits[0].title}</td>` +
      //     `<td>${doc.commits[i].count}</td></tr>`;
      //     // `<td id=${habits[0]._id}>${doc.commits[i].count}</td></tr>`;
      //     habitsTable.innerHTML += tr;
      //   });
      // }
    }
  });
}

function getCurrentDate() {
  const dt = new Date();
  const epochDt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12).getTime();
  // Convert to seconds
  const currentDate = Math.floor(epochDt / 1000);
  return currentDate;
}
const inputDate = getCurrentDate();
display(inputDate);
