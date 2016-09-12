'use strict'
const debug = require('debug')('gorhCli:cliInit')
debug('cliInit')

const path = require('path')
const os = require('os')

const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red

const confMan = require('./confMan')
const getConf = confMan.getConf

const utils = require('./utils')
const checkFileExistsSync = utils.checkFileExistsSync

/**
 * init the cli and provide a common config file for all commands
 * changes the cwd to the .gorhrc file one
 *
 * @returns
 */
function cliInit () {
  // caches the path of the dir where the cli have been inited
  const rcFile = '.gorhClirc'
  const cliDir = process.cwd()
  // const rcPath = path.join(cliDir, '/', rcFile)

  // check for a user config file in os root dir
  const hasUserConfig = checkFileExistsSync(path.join(os.homedir(), '/', rcFile))
  debug(blue('hasUserConfig:', hasUserConfig))

  // look for a .gorhclirc file load template one if none is found
  const conf = getConf()
  // debug('conf')

  // initialise the cliConf object
  const cliConf = {
    confIsLoaded: false, // flag to check if a rcfile is found
    cliDir, // dir where the cli is invoqued
    rcFile, // name of the rcfile
    rcPath: cliDir, // defaults to curent dir
    hasUserConfig, // is there a main config in /home
    initConf: conf // conf loaded via rc
  }

  if (conf.defaultConf === false) {
    cliConf.confIsLoaded = true
    cliConf.rcPath = path.dirname(conf.config)
  }
  cliConf.isFromInit = true
  // change cwd to th rc file one if they differ
  if (_.isEqual(cliConf.cliDir, cliConf.rcPath) !== true) {
    debug(red('cli and rc dir does not match !!'))
    debug(blue('cwd:'), process.cwd())
    try {
      process.chdir(cliConf.rcPath)
      debug('new cwd: ' + process.cwd())
    } catch (err) {
      debug('chdir: ' + err)
    }
  }
  debug(blue('Initial config\n'))
  debug(cliConf)
  return cliConf
}

module.exports = cliInit
