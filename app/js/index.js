'use strict';

const reqlib = require('app-root-path').require;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');
const db = reqlib('nedb.js');

const userName = document.querySelector('#userName');
userName.innerHTML = config.readSettings(constants.userNameKey);

db.habits.count({}, (err, count) => {
  console.log(count);
});
