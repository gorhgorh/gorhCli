/* demo command use this file as a base for new ones */
'use strict'
const cmdName = 'testCmd'
const cmdMsg = 'command to test new features, expect magic to happend'
const debug = require('debug')('gorhCli:' + cmdName)
// const path = require('path')
// const fs = require('fs-extra')
// const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

const utils = require('../utils')
const getDirsInfo = utils.getDirsInfo
const buildCourseList = utils.buildCourseList
const buildCourse = utils.buildCourse
// const checkFileExistsSync = utils.checkFileExistsSync

function Cmd (vorpal, cliConf) {
  // const rcPath = cliConf.rcPath
  const conf = cliConf.initConf
  // const rcFile = cliConf.rcFile
  const cliDir = cliConf.cliDir
  // const coursesPath = path.join(cliDir, conf.coursePath)
  // const buildPath = path.join(cliDir, conf.buildsPath)

  return vorpal
    .command('demo', cmdMsg)
    .alias('t')
    .option('-s, --single [course]', 'single course, dirname provided as arg')
    .option('-l, --list', 'select a list of dirs')
    .action(function (args, cb) {
      const self = this
      debug(blue(cmdName, 'start'))
      // const opt = {
      //   prompt: false
      // }

      const dirsInfos = getDirsInfo(conf, cliDir)
      if (getDirsInfo === false) {
        self.log('invalid config')
        return cb()
      }

      debug(blue('dirlistInfos'), dirsInfos)

      // TODO treat list case
      if (args.options.list === true) {
        debug(blue('list'), args.options.list)
        // return cb()
      }

      debug('dirInfos', dirsInfos)
      if (dirsInfos !== false) {
        buildCourseList(dirsInfos, self)
      } else {
        debug('dirsinfo = false')
        self.log('no available dir to build')
      }


    // cb()
    })
}

module.exports = {Cmd}
