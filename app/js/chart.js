'use strict';

const reqlib = require('app-root-path').require;

const db = reqlib('nedb.js');
const commitLog = {};

function getCommitLogForCurrentMonth(callback) {
  const now = new Date();
  const epochMonthStart = Math.floor(
    new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000
  );
  db.commits.find({ date: { $gte: epochMonthStart } }, (err, commits) => {
    for (let i = 0, len = commits.length; i < len; i++) {
      const commitsForHabits = commits[i].commits;
      const habitIds = Object.keys(commitsForHabits);
      const totalCommitsForDay = habitIds.reduce(
        (total, habitId) => total + commitsForHabits[habitId], 0
      );
      commitLog[commits[i].date] = totalCommitsForDay;
    }
    callback(commitLog);
  });
}

module.exports = { getCommitLogForCurrentMonth };
