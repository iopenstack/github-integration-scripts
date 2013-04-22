var Q = require('Q');
var config = require('./configuration.js').config;

var rest = require('restler');
var defer = Q.defer();

var branchName = process.argv[2];  //THE BRANCH NAME MUST BE INCLUDED AS AN ARGUMENT

var resolveData = function(data){
	defer.resolve(data);
	defer.promise;
	return data;
}

var handleError = function(error){
	console.log("An Error occurred: '" + error.message = "'");
	defer.resolve(error);
	defer.promise;
	return error;
}

return Q.fcall(function () {
	console.log("Retrieving Commits")
	rest.get('https://api.github.com/repos/' + config.owner + '/' + config.repoName + '/commits', 
			{ headers: config.theHeaders }
		).on('success', resolveData).on('fail', handleError);
}).then( function() {
	return defer.promise;
}).then( function(commits) {
	console.log("Creating New Branch: " + branchName);

	var lastCommit = commits[0];
	var ref = "refs/heads/" + branchName;
    var data = JSON.stringify({ref: ref, sha: lastCommit.sha });

    rest.post('https://api.github.com/repos/' + config.owner + '/' + config.repoName + '/git/refs', {
    	headers: config.theHeaders, 
    	data: data
    }).on('success', resolveData).on('fail', handleError);
}).then( function(){
	return defer.promise
}).then( function(){
	console.log("Branch Created");
});