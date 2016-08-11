'use strict'
const sh = require('shelljs')
const debug = require('debug')('shell')

function getCliPath () {
  let pwdP = sh.pwd().stdout
  return pwdP
}

function cleanDir (dir) {
  debug('cleanDir called')
}

function checkShellCmd (cmd, args) {

}

module.exports = {
  getCliPath,
  checkShellCmd,
  cleanDir,
  exec: sh.exec
}
