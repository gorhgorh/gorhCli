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
let dirList = []
// const mag = chalk.magenta

const utils = require('../utils')
const listDirs = utils.listDirs
const symCourse = utils.symCourse
const isDirSymlink = utils.isDirSymlink

const confMan = require('../confMan')
const getConf = confMan.getConf

function cmdAction (args, cb) {
  // get the configuration file
  const self = this
  const conf = getConf()
  let cliDir = process.cwd()

  let coursesPath = path.join(cliDir, conf.coursePath)
  let cPath = path.join(coursesPath, '/course')

  if (_.has(conf, 'coursePath') !== true) {
    self.log(red('no coursePath paths'))
    return cb()
  }

  // const cliDir = process.cwd()
  // const coursesPath = path.join(cliDir, conf.coursePath)
  // const cPath = path.join(coursesPath, 'course')
  // let dirList = listDirs(coursesPath, /course-/)

  // if list is empty, return
  let symLink
  debug('dirList', dirList)

  let isCurrCourse = false
  // check if cpath exist
  try {
    isCurrCourse = fs.statSync(cPath).isDirectory()
  } catch (error) {
    // debug(iConf)
    if (_.has(conf, 'config') === true) {
      debug(conf.config)
      cliDir = path.dirname(conf.config)
      debug(blue('switch cwd to:'), cliDir)
      coursesPath = path.join(cliDir, conf.coursePath)
      cPath = path.join(coursesPath, '/course')
    } else {
      self.log(blue('path does not exists :'), cPath, blue('\nplease verify that you are on the home folder, or that the folder exists'))
      return cb()
    }
  }
  if (isCurrCourse === true) {
    debug(blue('course is a dir'))
    if (isDirSymlink(cPath) !== true) {
      self.log('target', cPath, 'is not a symlink, canceling')
      return cb()
    }
    debug('is it a symlink ?', isDirSymlink(cPath))
  }

  dirList = listDirs(coursesPath, /course-/)
  if (dirList.length < 1 || dirList === false) {
    self.log(red('no dir in'), coursesPath)

    return cb()
  }

  if (isCurrCourse === true) {
    const linkPath = fs.realpathSync(cPath)
    debug('cPath:', linkPath.split('/').pop())
  }
  // debug(args.folda)
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

    if (symCourse(args.folda, 'course', coursesPath, true) === true) {
      self.log(blue('current course changed to:', args.folda))
    } else {
      debug(blue('carammba can not switch to:', args.folda))
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
