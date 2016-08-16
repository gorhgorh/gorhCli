/* command to build adapt courses require grunt */
'use strict'
const debug = require('debug')('Rc')
// const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
const mag = chalk.magenta

const defaultKeys = ['_', 'configs', 'config']

function cleanRc (conf, keys) {
  let clConf = JSON.parse(JSON.stringify(conf))
  if (keys) defaultKeys.push(...keys)
  _.each(defaultKeys, function (key) {
    delete clConf[key]
  })
  debug(blue('cleaned conf'))
  debug(clConf)
  return clConf
}

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync
function rcCmd (vorpal, cliConf) {
  const rcPath = cliConf.rcPath
  const conf = cliConf.initConf
  const rcFile = cliConf.rcFile

  return vorpal
    .command('create rc', 'create the config file')
    .alias('rc')
    .alias('r')
    .action(function (args, cb) {
      debug(blue('rcCmd start'))
      const self = this
      // chech if a yesrc.cson file exist
      const isRc = checkFileExistsSync(rcPath)
      if (isRc !== true) {
        this.prompt({
          type: 'confirm',
          name: 'createRc',
          default: true,
          message: 'no ' + rcFile + ' file found, create one ?'
        }, function (result) {
          // create one
          if (result.createRc) {
            self.log(mag('create', rcFile))
            const cleanedConf = cleanRc(conf)
            ++cleanedConf.confVersion
            fs.writeJson(rcPath, cleanedConf, function () {
              self.log(blue('conf written'))
              cb()
            })
          } else {
            self.log(blue('no conf written'))
            cb()
          }
        })
      } else {
        self.log(blue('there is already a', rcFile))
        cb()
      }
    })
}

module.exports = rcCmd
