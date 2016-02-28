'use strict';

const appRoot = require('app-root-path');

const Datastore = require('nedb');
const db = {};

db.habits = new Datastore({ filename: `${appRoot}/database/habits.db`, autoload: true });
db.commits = new Datastore({ filename: `${appRoot}/database/commits.db`, autoload: true });

module.exports.habits = db.habits;
module.exports.commits = db.commits;
