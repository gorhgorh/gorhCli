'use strict'
// ✔, ✖
const cmdName = 'rc'
const cmdNameDesc = cmdName // + ' [dirnames...]'
const cmdMsg = 'create the config file'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')
const path = require('path')
const _ = require('lodash')
const wne = require('is-equal/why')
const fs = require('fs-extra')
const sjc = require('strip-json-comments')
// const shelljs = require('shelljs')
// const exec = shelljs.exec
// const which = shelljs.which

// const archiver = require('archiver')
// const async = require('async')

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync
// const checkDeps = utils.checkDeps
// const filterExistingDirs = utils.filterExistingDirs
// const makePromtChoices = utils.makePromtChoices
// const listDirs = utils.listDirs
// const symCourse = utils.symCourse

const confMan = require('../confMan')
const getConf = confMan.getConf

const defaultKeys = ['_', 'configs', 'config']
/**
 * clean a config object from rc specific keys
 * if a keys array is provided, arr entries will be cleared too
 *
 * @param {any} conf
 * @param {any} keys
 * @returns {object} cleaned configuration
 */
function cleanRc (conf, keys) {
  let clConf = JSON.parse(JSON.stringify(conf))
  if (keys) defaultKeys.push(...keys)
  _.each(defaultKeys, function (key) {
    delete clConf[key]
  })
  debug(blue('conf cleaned'))
  return clConf
}

/**
 * compare two confs and return true is equal and a string containing diffs if not
 *
 * @param {object} conf from cli
 * @param {object} rcConf conf from the rc file
 * @returns
 */
function compareConf (conf, rcConf) {
  const clConf = cleanRc(conf)
  const clRcConf = cleanRc(rcConf)
  debug(clConf)
  debug(clRcConf)

  debug('clRcConf.confVersion', clRcConf.confVersion, 'clConf.confVersion', clConf.confVersion)
  var isEq = wne(clConf, clRcConf)
  if (isEq !== '') {
    debug('isEq:', isEq)
    return isEq
  } else {
    return true
  }
}

/**
 * write a config at a given path, cleaning it from rc info
 *
 * @param {any} conf
 * @param {any} rcPath
 * @param {any} self
 * @param {any} cb
 */
function writeConf (conf, rcPath, self, cb) {
  debug(blue('beging writeConf', rcPath))
  const cleanedConf = cleanRc(conf)
  debug(rcPath)
  ++cleanedConf.confVersion
  fs.writeJson(rcPath, cleanedConf, function () {
    debug(blue('conf written'))
    if (self) self.log(blue('conf written'))
    if (cb) return cb()
    else return true
  })
}

function cmdAction (args, cb) {
  // get the configuration file
  debug(blue('start mod rc cmd'))
  const self = this
  const conf = getConf()
  const opts = args.options
  const cliDir = process.cwd()
  const rcName = '.gorhClirc'
  const rcPath = path.join(cliDir, rcName)
  if (checkFileExistsSync(rcPath) !== true) {
    this.prompt({
      type: 'confirm',
      name: 'createRc',
      default: true,
      message: 'no ' + rcName + ' file found, create one ?'
    }, function (result) {
      // create one
      if (result.createRc) {
        writeConf(conf, rcPath, self, cb)
      } else {
        debug(blue('no conf written'))
        cb()
      }
    })
  // there is an rc file
  } else {
    self.log(blue('there is already a', rcName, 'file'))
    // self.log(blue('there is already a config filee'))
    if (opts.check === true) {
      debug(blue('checking conf'))
      const rcConf = confMan.getConf()
      const compared = compareConf(conf, rcConf)
      self.log(blue('are conf identical ?'), compared)
    } else {
      self.log(conf)
    }
  }

  cb()
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('r')
    .option('-c, --check', 'check if in memory configurations matches file conf')
    // .option('-d, --adapt', 'initialise an adapt repo')
    .option('-s, --standard', 'install standard.js')
    .option('-n, --noPrompts', "use default options, don't show prompts")
    .action(cmdAction)
    // .hidden()
}
