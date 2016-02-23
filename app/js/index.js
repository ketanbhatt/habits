'use strict';

var config = require('../configuration');  // TODO: Fix this bad way of refrencing
var constants = require('../constants');  // TODO: Fix this bad way of refrencing
var userName = document.querySelector('#userName');

userName.innerHTML = config.readSettings(constants.userNameKey);