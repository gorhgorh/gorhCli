'use strict'
const testName = 'shell'
const debug = require('debug')('gorhCli:test:' + testName)
var test = require('tape')

var sh = require('../shellCmds')

var cliPath = sh.getCliPath()
// var commonTests = require('./commonTests')

// create a test directory for testing the cleanDirFunc
function createTestDirs () {
  console.log(__dirname)
}

createTestDirs()

test('getCliPath ', function (t) {
  // it should return a string containg a path
  t.equal(typeof (cliPath), 'string')
  // it should return the dir where it is invoqued (here the project base)
  t.equal(cliPath + '/test', __dirname)
  t.end()
})
