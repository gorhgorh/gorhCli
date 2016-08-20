/* demo command use this file as a base for new ones */
'use strict'
const cmdName = 'test'
const cmdMsg = 'command to test new features, expect magic to happend'
const debug = require('debug')(cmdName)
// const path = require('path')
// const fs = require('fs-extra')
// const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

// const utils = require('../utils')
// const checkFileExistsSync = utils.checkFileExistsSync

function Cmd (vorpal, cliConf) {
  // const rcPath = cliConf.rcPath
  // const conf = cliConf.initConf
  // const rcFile = cliConf.rcFile

  return vorpal
  .command('demo', cmdMsg)
  .alias('t')
  .action(function (args, cb) {
    debug(blue(cmdName, 'start'))
    // const self = this
    cb()
  })
}

module.exports = {Cmd}
