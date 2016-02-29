'use strict';
/* globals CalHeatMap */

const reqlib = require('app-root-path').require;

const config = reqlib('configuration.js');
const constants = reqlib('constants.js');
const db = reqlib('nedb.js');

const cal = new CalHeatMap();
const userName = document.querySelector('#userName');
userName.innerHTML = config.readSettings(constants.userNameKey);

db.habits.count({}, (err, count) => {
  console.log(count);
});

const data = {
  1456180083: 13,
  1456282083: 24,
  1456482083: 1,
  1456680083: 5,
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
