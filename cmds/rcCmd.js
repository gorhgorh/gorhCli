/* command to build adapt courses require grunt */
'use strict'
const debug = require('debug')('gorhCli:rc')
// const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')
// const equal = require('is-equal')
const wne = require('is-equal/why')
const sjc = require('strip-json-comments')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

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

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync

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
  ++cleanedConf.confVersion
  fs.writeJson(rcPath, cleanedConf, function () {
    debug(blue('conf written'))
    if (self) self.log(blue('conf written'))
    if (cb) return cb()
    else return true
  })
}

function overridePrompt (self, cb, conf, rcPath, diffMsg) {
  self.prompt({
    type: 'expand',
    name: 'continue',
    default: true,
    message: 'Conflict on configfile',
    choices: [
      {
        key: 'y',
        name: 'Overwrite',
        value: 'overwrite'
      },
      {
        key: 'd',
        name: 'Show diff',
        value: 'diff'
      },
      {
        key: 'x',
        name: 'Abort',
        value: 'abort'
      }
    ]
  }, function (result) {
    switch (result.continue) {
      case 'diff' :
        if (!diffMsg) diffMsg = 'no diff Msg'
        debug('diff')
        self.log(diffMsg)
        break
      case 'overwrite' :
        debug('overwrite')
        debug(conf)
        writeConf(conf, rcPath, self)
        break
      default :
        debug(blue('result', result.continue))
        self.log('abort')
    }
    cb()
  })
}

function overwriteConf (conf, rcConf, rcPath, self, cb) {
  conf.name = 'testOConf'
  const isConfEqual = compareConf(conf, rcConf)
  if (isConfEqual === true) {
    debug(blue('confs are identical'))
    cb()
  } else {
    debug(blue('confs are diferrent'), isConfEqual)
    overridePrompt(self, cb, conf, rcPath, isConfEqual)
  }
}

/**
 * command 'rc' creates a rc file if it does not exist
 *
 * @param {object} vorpal instance
 * @param {any} cliConf configuration passed by the cli
 * @returns
 */
function rcCmd (vorpal, cliConf) {
  const rcPath = cliConf.rcPath
  const conf = cliConf.initConf
  const rcFile = cliConf.rcFile

  return vorpal
    .command('rc', 'create the config file')
    .alias('rc')
    .alias('r')
    .action(function (args, cb) {
      debug(blue('rcCmd start'))
      const self = this
      // chech if a yesrc.cson file exist
      const isRc = checkFileExistsSync(rcPath)
      // no rc
      if (isRc !== true) {
        this.prompt({
          type: 'confirm',
          name: 'createRc',
          default: true,
          message: 'no ' + rcFile + ' file found, create one ?'
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
        // get the dir rcfile object
        self.log(blue('there is already a', rcFile))
        const rcConf = JSON.parse(sjc(fs.readFileSync(rcPath, 'utf-8')))
        // promt for overwritting conf, and write it if users wants to
        const isOverRiden = overwriteConf(conf, rcConf, rcPath, self, cb)
        if (isOverRiden === false) self.log('failed')
      }
    })
}

module.exports = rcCmd
