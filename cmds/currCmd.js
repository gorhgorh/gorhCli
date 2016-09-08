'use strict'
// ✔, ✖
const cmdName = 'mod'
const cmdNameDesc = cmdName // + ' [dirnames...]'
const cmdMsg = 'modifed testCmd'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')
// const path = require('path')
// const _ = require('lodash')
// // const fs = require('fs-extra')
// const shelljs = require('shelljs')
// const exec = shelljs.exec
// const which = shelljs.which

// const archiver = require('archiver')
// const async = require('async')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

// const utils = require('../utils')
// const checkFileExistsSync = utils.checkFileExistsSync
// const checkDeps = utils.checkDeps
// const filterExistingDirs = utils.filterExistingDirs
// const makePromtChoices = utils.makePromtChoices
// const listDirs = utils.listDirs
// const symCourse = utils.symCourse

const confMan = require('../confMan')
const getConf = confMan.getConf

function cmdAction (args, cb) {
  // get the configuration file
  debug(blue('start modified cmd'))
  const self = this
  const conf = getConf()
  const opts = args.options
  const cliDir = process.cwd()
  // debug(cliDir, opts)
  // debug(conf)

  const cmdOpt = {
    noPrompts: false,
    initList: {
      baseFileCopy: false,
      gitInit: true,
      npmInit: false,
      // rcInit: true,
      // adapt: false,
      standard: false
    }
  }
  debug(self.parent.iConf)
  // alter default conf depenfing on cmd options
  if (opts.noPrompts === true) cmdOpt.noPrompts = true
  if (opts.adapt === true) cmdOpt.initList.adapt = true
  if (opts.standard === true) cmdOpt.initList.standard = true

  // if build all option
  if (opts.all === true) {
    debug('all')
  } else {
    // else if clear all builds
  }
  return cb()
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('t')
    .option('-a, --all', 'all option on, no prompt')
    // .option('-d, --adapt', 'initialise an adapt repo')
    .option('-s, --standard', 'install standard.js')
    .option('-n, --noPrompts', "use default options, don't show prompts")
    .action(cmdAction)
    .hidden()
}
