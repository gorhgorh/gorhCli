#!/usr/bin/env node
'use strict'
/* global */
const debug = require('debug')('gorhCli:CLI')
const path = require('path')
// const _ = require('lodash')
const os = require('os')

const chalk = require('chalk')
// const red = chalk.red
const blue = chalk.cyan
const green = chalk.green
// const mag = chalk.magenta

const startMsg = require('./startMsgs')

console.log(green(startMsg()))

const vorpal = require('vorpal')()

const utils = require('./utils')
const checkFileExistsSync = utils.checkFileExistsSync
// const clearDir = utils.clearDir

const sh = require('./shellCmds')
// const exec = sh.exec
const gCliDir = sh.getCliPath // return current cliPath

// const buildAction = builder.buildAction

// clear command
const clearCmd = require('./cmds/clearCmd')

// rc command
const rcCmd = require('./cmds/rcCmd')
// const rcCmd = require('./cmds/rcCmd')

// currCmd command (currently in dev cmd)
const currCmd = require('./cmds/currCmd')

// init command
const initCmd = require('./cmds/initCmd')

// man command
const manCmd = require('./cmds/manifestCmd')

// build command
const build = require('./cmds/buildCmd')
const buildCmd = build.Cmd

// build command
const zipCmd = require('./cmds/zipCmd')

// build command
const switchCmd = require('./cmds/switchCmd')

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
debug(green('got init config, v:'), conf.confVersion)
// let confIsLoaded = false

const cliConf = {
  confIsLoaded: false,
  cliDir,
  rcFile,
  rcPath,
  hasUserConfig,
  initConf: conf
}

// create manifests
manCmd(vorpal, cliConf)

// create manifests
buildCmd(vorpal, cliConf)

// command to build, make manifests and zips all the dirs in the rc file
vorpal
  .command('make')
  .alias('mk')
  .description('builds, make manifests, zips all the dirs ')
  .action(function (args, callback) {
    vorpal.execSync('b')
    vorpal.execSync('m')
    vorpal.execSync('z')
    callback()
  })

// lazy shorthand
vorpal
  .command('hello')
  .alias('hi')
  .alias('ii')
  .description('init with style')
  .action(function (args, callback) {
    vorpal.execSync('i -f')
  })

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
  .use(currCmd)
  .use(rcCmd)
  .use(clearCmd)
  .use(zipCmd)
  .use(initCmd)
  .use(switchCmd)
  .show()
  .parse(process.argv)
