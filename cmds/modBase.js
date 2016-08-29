'use strict'
const cmdName = 'clear'
const cmdMsg = 'clean directories'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')
const path = require('path')
const _ = require('lodash')
const fs = require('fs-extra')
// const archiver = require('archiver')
// const async = require('async')
const chalk = require('chalk')
// const blue = chalk.cyan
const red = chalk.red
const green = chalk.green
// const mag = chalk.magenta

const utils = require('../utils')
const listDirs = utils.listDirs
const symCourse = utils.symCourse

const confMan = require('../confMan')
const getConf = confMan.getConf

function cmdAction (args, cb) {
  // get the configuration file
  const self = this
  const conf = getConf()

  if (_.has(conf, 'buildsPath') !== true) {
    self.log(red('no build paths'))
    return cb()
  }

  const cliDir = process.cwd()
  const coursesPath = path.join(cliDir, conf.coursePath)
  const cPath = path.join(coursesPath, 'course')
  let dirList = listDirs(coursesPath, /course-/)
  let symLink
  if (dirList.length < 1) {
    self.log(red('no dir in'), coursesPath)
    return cb()
  }
  let isCurrCourse = false
  try {
    isCurrCourse = fs.statSync(cPath).isDirectory()
  } catch (error) {
    debug(error)
    return cb()
  }
  if (isCurrCourse === true) {
    const linkPath = fs.realpathSync(cPath)
    debug('cPath:', linkPath.split('/').pop())
  }

  self.prompt({
    type: 'list',
    name: 'symDir',
    message: 'select the dirs you want manifest for',
    choices: dirList
  }, function (result) {
    symLink = result.symDir
    debug(symLink, isCurrCourse)
    symCourse(symLink, 'course', coursesPath)
    self.log(green('current course changed to:'), symLink)
    // const manifestInfos = makeManInfoArr(coursesNames, conf.courses)
    // debug('desto', buildPath)
    // makeMans(manifestInfos, buildPath, self)
    // cb()
  })

// debug(conf)
// cb()
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdName, cmdMsg)
    .alias('d')
    .action(cmdAction)
    .hidden()
}
