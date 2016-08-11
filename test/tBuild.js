const testName = 'testBuild'
const debug = require('debug')(testName)
const test = require('tape')

debug('testing', testName)

const cmd = require('../cmds/build')

const cliPath = __dirname
// var commonTests = require('./commonTests')

// create a test directory for testing the cleanDirFunc
function createTestDirs () {
  console.log(__dirname)
}

createTestDirs()

test('build ', function (t) {
  // it should return a string containg a path
  t.equal(typeof (cliPath), 'string')
  // it should return the dir where it is invoqued (here the project base)
  t.end()
})
