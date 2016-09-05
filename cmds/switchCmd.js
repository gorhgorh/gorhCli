'use strict'
const cmdName = 'switch'
const cmdNameDesc = cmdName + ' [folda]'
const cmdMsg = 'change symlink of the course folder'
const debug = require('debug')('gorhCli:' + cmdName)
const path = require('path')
const _ = require('lodash')
const fs = require('fs-extra')
const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
const green = chalk.green
// const mag = chalk.magenta

const utils = require('../utils')
const listDirs = utils.listDirs
const symCourse = utils.symCourse

const confMan = require('../confMan')
const getConf = confMan.getConf

const iConf = getConf()
const cliDir = process.cwd()

const coursesPath = path.join(cliDir, iConf.coursePath)

debug(coursesPath, cliDir)
const cPath = path.join(coursesPath, '/course')
let dirList = listDirs(coursesPath, /course-/)

function cmdAction (args, cb) {
  // get the configuration file
  const self = this
  const conf = getConf()

  if (_.has(conf, 'coursePath') !== true) {
    self.log(red('no coursePath paths'))
    return cb()
  }

  // const cliDir = process.cwd()
  // const coursesPath = path.join(cliDir, conf.coursePath)
  // const cPath = path.join(coursesPath, 'course')
  // let dirList = listDirs(coursesPath, /course-/)
  let symLink
  if (dirList.length < 1) {
    self.log(red('no dir in'), coursesPath)
    return cb()
  }
  let isCurrCourse = false
  try {
    isCurrCourse = fs.statSync(cPath).isDirectory()
  } catch (error) {
    self.log('path does not exists :', cPath, 'verify that you are on the home folder')
    return cb()
  }
  if (isCurrCourse === true) {
    const linkPath = fs.realpathSync(cPath)
    debug('cPath:', linkPath.split('/').pop())
  }
  debug(args.folda)
  if (_.has(args, 'folda') !== true) {
    self.prompt({
      type: 'list',
      name: 'symDir',
      message: 'select the dir you to use as course',
      choices: dirList
    }, function (result) {
      symLink = result.symDir
      debug(symLink, isCurrCourse)
      symCourse(symLink, 'course', coursesPath)
      self.log(green('current course changed to:'), symLink)
    })
  } else {
    debug(blue('target course'), args.folda)

    if (symCourse(args.folda, 'course', coursesPath, cb) === true) {
      self.log(blue('switched to', args.folda))
    } else {
      cb()
    }
  }
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('sw')
    .autocomplete(dirList)
    .action(cmdAction)
}
