var Q = require('q'),
  rest = require('restler');
var config = require('./configuration.js').config;

//THE BRANCH NAMES MUST BE INCLUDED AS AN ARGUMENT
var uiBranchName = process.argv[2],
  apiBranchName = process.argv[3];

var uiPulls, apiPulls, requests;

var fetchPullRequest = function(repoName) {
  var defer = Q.defer();
  rest.get('https://api.github.com/repos/' + config.owner + '/' + repoName + '/pulls', {
    headers: config.theHeaders
  })
  .on('success', function(data) {
    defer.resolve(data);
  })
  .on('fail', function(error) {
    console.log("Error retrieving repo " + repoName + ": " + error.message);
    defer.reject(error.message);
  });

  return defer.promise;
};

var findPullRequestByBranch = function(branch, pulls, repoName) {
  var pullRequest;

  try {
    for (var i = 0; i <= pulls.length; i++) {
      if (pulls[i].head.ref == branch) {
        pullRequest = pulls[i];
        break;
      }
    }
  } catch (error) {
    console.log("Error occurred when attempting to find a pull request in '" + repoName + "'");
  }

  if (!pullRequest && !isMasterBranch(branch)) {
    throw "Unable to find a pull request with a branch name of '" + branch + "' in '" + repoName + "'";
  }

  return pullRequest;
};

var mergePullRequest = function(branch, request) {
  var defer = Q.defer();

  rest.put(request.url + "/merge", {
    headers: config.theHeaders,
    data: JSON.stringify({
      'commit_message': 'Automatically Merged'
    })
  }).on('success', function(data) {
    defer.resolve(data);
    console.log("Merged pull request: '" + request.html_url + "' with the branch name: '" + branch + "'");
  }).on('fail', function(error) {
    console.log("Unable to merge pull request '" + request.html_url + "' with the branch name: '" + branch + "'");
    defer.reject(error.message);
  });

  return defer.promise;
};

var isMasterBranch = function(branchName) {
  return branchName === "master";
};


return Q.fcall(function() {
  console.log('Reviewing UI Branch');
  return isMasterBranch(uiBranchName) ? [] : fetchPullRequest(config.uiRepo);
}).then(function(pullRequests) {
  uiPulls = pullRequests;
  return isMasterBranch(apiBranchName) ? [] : fetchPullRequest(config.apiRepo);
}).then(function(pullRequests) {
  apiPulls = pullRequests;

  requests = {
    ui: findPullRequestByBranch(uiBranchName, uiPulls, config.uiRepo),
    api: findPullRequestByBranch(apiBranchName, apiPulls, config.apiRepo)
  };

  return;
}).then(function() {
  return (requests.api) ? mergePullRequest(apiBranchName, requests.api) :
    console.log("Skipping merge of '" + config.apiRepo + "' because branch is master");
}).then(function() {
  return (requests.ui) ? mergePullRequest(uiBranchName, requests.ui) :
    console.log("Skipping merge of '" + config.uiRepo + "' because branch is master");
});