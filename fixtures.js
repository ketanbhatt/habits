'use strict';

const appRoot = require('app-root-path');
const Datastore = require('nedb');

const db = {};
db.habits = new Datastore({ filename: `${appRoot}/data/habits.db`, autoload: true });
db.commits = new Datastore({ filename: `${appRoot}/data/commits.db`, autoload: true });

function addBulkHabits() {
  const habitDocs = [
    { title: 'Hello' },
    { title: 'Jello' },
    { title: 'Chello' },
  ];
  db.habits.insert(habitDocs);
}


function addBulkCommits() {
  db.habits.findOne({}, (err, habit) => {
    const now = new Date();
    const commitDocs = [];
    for (let i = 0; i < 7; i++) {
      const doc = { commits: {} };
      const time = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i).getTime() / 1000;
      doc.date = time;
      doc.commits[habit._id] = 5 + i;
      commitDocs.push(doc);
    }

    db.commits.insert(commitDocs);
  });
}

module.exports = { addBulkHabits, addBulkCommits };

