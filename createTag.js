var Q = require('Q');
var config = require('./configuration.js').config;

var rest = require('restler');

var date = new Date().toISOString();

var resolveData = function(data){
	defer.resolve(data);
}

var handleError = function(error){
	defer.reject(error);
}

return Q.fcall(function () {
	console.log("Retrieving Commits");

	var defer = Q.defer();
	rest.get('https://api.github.com/repos/' + config.owner + '/' + config.repoName + '/commits', 
			{ headers: config.theHeaders})
		.on('success', function(data) { defer.resolve(data) })
		.on('fail', function(error) { defer.reject(error) });
	return defer.promise;

}).then( function( commits ) {
	console.log("Creating Tag Object")

	var defer = Q.defer();
	var lastCommit = commits[0];
	var body = { tag: date, message: 'Automatically Created Tag',object: lastCommit.sha,
			type: 'commit', tagger: { name: config.owner, date: date }
		};

	var data = JSON.stringify(body);

	rest.post('https://api.github.com/repos/' + config.owner + '/' + config.repoName + '/git/tags', {
			headers: config.theHeaders, data: data
		})
		.on('success', function(data) { defer.resolve(data) })
		.on('fail', function(error) { defer.reject(error) });
	return defer.promise;
}).then( function(tagObject){
	console.log("Creating Tag on Github");
	
	var defer = Q.defer();
	var data = JSON.stringify({ ref: 'refs/tags/' + date, sha: tagObject.sha});

	console.log(tagObject)

	rest.post('https://api.github.com/repos/' + config.owner + '/' + config.repoName + '/git/refs', {
			headers: config.theHeaders, data: data
		})
		.on('success', function(data) { defer.resolve(data) })
		.on('fail', function(error) { defer.reject(error) });
}).then( function(){

	console.log("Created tag: '" + date + "' on repo '" + config.repoName + "'")
});








