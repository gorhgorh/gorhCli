#!/usr/bin/env node
'use strict'
/* global */
const debug = require('debug')('CLI')
const path = require('path')
// const _ = require('lodash')
const os = require('os')

const chalk = require('chalk')
// const red = chalk.red
const blue = chalk.cyan
const green = chalk.green
// const mag = chalk.magenta

const vorpal = require('vorpal')()

const utils = require('./utils')
const checkFileExistsSync = utils.checkFileExistsSync
// const clearDir = utils.clearDir

const sh = require('./shellCmds')
// const exec = sh.exec
const gCliDir = sh.getCliPath // return current cliPath

// const builder = require('./cmds/build')
// const buildAction = builder.buildAction

// clear command
const clearCmd = require('./cmds/clearCmd')

// rc command
const rcCmd = require('./cmds/rcCmd')

// init command
const initCmd = require('./cmds/initCmd')

// man command
const manCmd = require('./cmds/manifestCmd')

// build command
const build = require('./cmds/buildCmd')
const buildCmd = build.Cmd

// caches the path of the dir where the cli have been inited
const rcFile = '.gorhClirc'
const cliDir = gCliDir()
const rcPath = path.join(cliDir, '/', rcFile)

// check for a user config file
const hasUserConfig = checkFileExistsSync(path.join(os.homedir(), '/', rcFile))
debug(blue('hasUserConfig:', hasUserConfig))

const confMan = require('./confMan')
const getConf = confMan.getConf
// const compConf = confMan.compareConf
debug(blue('getting init config'))
let conf = getConf()
debug(green('got init config'), conf.version)
// let confIsLoaded = false

const cliConf = {
  confIsLoaded: false,
  cliDir,
  rcFile,
  rcPath,
  hasUserConfig,
  initConf: conf
}

// clear cmd
clearCmd(vorpal, cliConf)

// create, write, manipulate rc file command
rcCmd(vorpal, cliConf)

// initialise the repository cmd
initCmd(vorpal, cliConf)

// create manifests
manCmd(vorpal, cliConf)

// create manifests
buildCmd(vorpal, cliConf)

// exit alias
vorpal
  .command('exi', 'exit shortcut')
  .alias('ex')
  .alias('e')
  .action(function (args, cb) {
    debug(blue('bye'))
  })
  .hidden()

vorpal
  .delimiter('gorhCLI $')
  .show()
  .parse(process.argv)
