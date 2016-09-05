const testName = 'testBuild'
const debug = require('debug')('gorhCli:test:' + testName)
const test = require('tape')
const fs = require('fs-extra')
var path = require('path')

// var tUtils = require('./testUtils')
// var crDirs = tUtils.createTestDirs

debug('testing', testName)

// const sym = cmd.symCourse

const cliPath = __dirname
const testDir = path.join(__dirname, 'testDir')
// var commonTests = require('./commonTests')

// create a test directory for testing the cleanDirFunc
function createTestDirs () {
  console.log(__dirname)
  fs.copySync(path.join(cliPath, '../sandbox/base'), path.join(testDir, '/testBuild'))
}

createTestDirs()

test('build ', function (t) {
  // it should return a string containg a path
  t.equal(typeof (cliPath), 'string')
  // it should return the dir where it is invoqued (here the project base)
  t.end()
})
