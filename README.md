# Requirements
* NodeJS installed
* Github Account
* Github API Token
* Existing Repo on Github

## Getting Started
* Create a github account: https://github.com/signup/free
* Create a API Token: https://help.github.com/articles/creating-an-oauth-token-for-command-line-use
* Add github username, repo name and api token to `configuration.js` file
* Install Dependencies by running `npm install` from project folder

## createBranch.js 
* Will create a branch based off of the latest commit on master

#### How to use:
`node createBranch.js name_of_branch_to_be_created`

## createTag.js
* Will create a tag of the latest commit in master
* Tag name will be the date if not specified

#### How to use:
`node createTag.js (optional_tag_name)`

## mergePullRequest.js
* Will merge a pull request based off a branch name

#### How to use: 
`node mergePullRequest.js name_of_branch_to_be_merged`