/*
 * configuration manager, this will load / update config file.
 * uses rc, so bye bye cson ... but cool config merging
*/
'use strict'
const debug = require('debug')('confMan')
const fs = require('fs-extra')
const path = require('path')
const pkg = fs.readJsonSync(path.join(__dirname, './package.json'))
const stripJsonComments = require('strip-json-comments')
const equal = require('is-equal')
const _ = require('lodash')

const confFile = fs.readFileSync(path.join(__dirname, './templates/.gorhClirc'), 'utf-8')
const defaultConf = JSON.parse(stripJsonComments(confFile))

// for the default configuration use current cli version as base version
const cliVersion = pkg.version

/**
 * load .gorhClirc and merges it with the default conf, then returns it
 *
 * @returns {object} configuration file
 */
function getConf () {
  const conf = require('rc')('gorhCli', defaultConf)
  if (_.has(conf, 'cliVersion') === false) conf.cliVersion = cliVersion
  return conf
}

/**
 * compare provided conf with current conf from rcFiles
 *
 * @param {objet} tarConf conf to compare with rc one
 * @returns {bool} true is identical
 */
function compareConf (tarConf) {
  const srcConf = getConf()
  debug('srcConf.confVersion', srcConf.confVersion, 'tarConf.confVersion', tarConf.confVersion)
  var isEq = equal(tarConf, srcConf)
  if (isEq !== true) {
    debug('isEq:', isEq)
    return false
  } else {
    return true
  }
}

const confManConf = getConf()

function writeConf (conf) {
}

module.exports = {
  getConf,
  compareConf,
  writeConf,
  confManConf
}
