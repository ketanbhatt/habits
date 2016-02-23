'use strict';

var ipc = require("electron").ipcRenderer;
var config = require('../configuration');  // TODO: Fix this bad way of refrencing
var constants = require('../constants');  // TODO: Fix this bad way of refrencing
var userNameButton = document.querySelector('#userNameButton');
var userNameField = document.querySelector('#userNameField');

userNameButton.addEventListener("click", function(){
	var name = userNameField.value;
	config.saveSettings(constants.userNameKey, name);
	ipc.send('close-settings-window');
});