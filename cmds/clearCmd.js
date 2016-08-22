#!/usr/bin/env node
'use strict'
const debug = require('debug')('gorhCli:' + 'clearCmd')

const chalk = require('chalk')
// const red = chalk.red
const blue = chalk.cyan
const green = chalk.green
const mag = chalk.magenta

const utils = require('../utils')
// const checkFileExistsSync = utils.checkFileExistsSync
const clearDir = utils.clearDir

function clearCmd (vorpal, cliConf) {
  return vorpal
  .command('clear', 'clean current dir')
  .alias('c')
  .option('-f --force')
  .action(function (args, cb) {
    debug('clear called')
    const cliDir = cliConf.cliDir
    const self = this
    var msg = 'this will clean current dir ' + cliDir
    if (args.options.force === true) {
      debug(blue('luke use the --force'))
      clearDir(cliDir)
      cb()
    } else {
      this.prompt({
        type: 'confirm',
        name: 'erase',
        default: false,
        message: msg
      }, function (result) {
        if (result.erase) {
          debug()
          self.log(mag('erasing'))
          clearDir(cliDir)
          self.log(green('cleared'))
          cb()
        } else {
          cb()
        }
      })
    }
  })
}

module.exports = clearCmd
