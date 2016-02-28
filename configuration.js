'use strict';

const appRoot = require('app-root-path');

const nconf = require('nconf').file({ file: `${appRoot}/habits-config.json` });

function saveSettings(settingKey, settingValue) {
  nconf.set(settingKey, settingValue);
  nconf.save();
}

function readSettings(settingKey) {
  nconf.load();
  return nconf.get(settingKey);
}

module.exports = { saveSettings, readSettings };
