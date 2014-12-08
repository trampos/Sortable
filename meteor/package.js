// package metadata file for Meteor.js
'use strict';

var packageName = 'rubaxa:sortable';  // http://atmospherejs.com/sortable/sortable
var where = 'client';  // where to install: 'client' or 'server'. For both, pass nothing.

var packageJson = JSON.parse(Npm.require("fs").readFileSync('package.json'));

Package.describe({
	name: packageName,
	summary: 'Sortable: reactive minimalist reorderable drag-and-drop lists on modern browsers and touch devices',
	version: packageJson.version,
	git: 'https://github.com/RubaXa/Sortable.git',
	readme: 'https://github.com/RubaXa/Sortable/blob/master/meteor/README.md'
});

Package.onUse(function (api) {
	api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);
	api.use('templating', 'client');
	api.export('Sortable');
	api.addFiles([
		'Sortable.js',
		'meteor/template.html',  // the HTML comes first, so reactivize.js can refer to the template in it
		'meteor/reactivize.js'
	], where);
});

Package.onTest(function (api) {
	api.use(packageName, where);
	api.use('tinytest', where);

	api.addFiles('meteor/test.js', where);
});
