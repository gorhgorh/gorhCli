var test = require('tape')

var sh = require('../shellCmds')

var cliPath = sh.getCliPath()
console.log(cliPath, __dirname.slice(0, -5))
// var commonTests = require('./commonTests')

test('getCliPath ', function (t) {
  // it should return a string containg a path
  t.equal(typeof (cliPath), 'string')
  // it should return the dir where it is invoqued (here the project base)
  t.equal(cliPath + '/test', __dirname)
  t.end()
})
