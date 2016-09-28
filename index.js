#!/usr/bin/env node
'use strict'
/* global */
const debug = require('debug')('gorhCli:CLI')

const chalk = require('chalk')
const blue = chalk.cyan
const green = chalk.green

const cliInit = require('./cliInit')

const startMsg = require('./startMsgs')

console.log(green(startMsg()))

const vorpal = require('vorpal')()

// clear command
const clearCmd = require('./cmds/clearCmd')
const dTC = require('./cmds/dTC')

// rc command
const rcCmd = require('./cmds/rcCmd')

// currCmd command (currently in dev cmd)
const currCmd = require('./cmds/currCmd')

// tradExtract command
const tradExtract = require('./cmds/tradExtractCmd')

// tradExtract command
const tradWrite = require('./cmds/tradWriteCmd')

// init command
const initCmd = require('./cmds/initCmd')

// man command
const manCmd = require('./cmds/manifestCmd')

// build command
const build = require('./cmds/buildCmd')
// const buildCmd = build.Cmd

// build command
const zipCmd = require('./cmds/zipCmd')

// build command
const switchCmd = require('./cmds/switchCmd')

// get the conf and init the cli
const cliConf = cliInit()

// debug(cliConf)
vorpal.iConf = cliConf
// debug(vorpal.iConf)

// create manifests
manCmd(vorpal, cliConf)

// create manifests
// buildCmd(vorpal, cliConf)

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
  .use(build)
  .use(currCmd)
  .use(tradExtract)
  .use(tradWrite)
  .use(rcCmd)
  .use(clearCmd)
  .use(zipCmd)
  .use(initCmd)
  .use(switchCmd)
  .use(dTC)
  .show()
  .parse(process.argv)
