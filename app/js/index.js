'use strict';

const config = require('../configuration');  // TODO: Fix this bad way of refrencing
const constants = require('../constants');  // TODO: Fix this bad way of refrencing
const userName = document.querySelector('#userName');

userName.innerHTML = config.readSettings(constants.userNameKey);
