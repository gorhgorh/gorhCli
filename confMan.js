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

const confFile = fs.readFileSync(path.join(__dirname, './templates/.gorhClirc'), 'utf-8')
const defaultConf = JSON.parse(stripJsonComments(confFile))
debug(defaultConf)

// for the default configuration use current cli version as base version
const cliVersion = pkg.version

function getConf (path) {
  // load .gorhClirc and merges it with the default conf, then returns it
  const conf = require('rc')('gorhCli', defaultConf)
  conf.version = cliVersion
  return conf
}

module.exports = {getConf}
