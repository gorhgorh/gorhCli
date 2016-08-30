/* demo command use this file as a base for new ones */
'use strict'
const cmdName = 'buildCmd'
const cmdMsg = 'builds adapt courses'
const debug = require('debug')('gorhCli:' + cmdName)
// const path = require('path')
// const fs = require('fs-extra')
// const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

const sh = require('shelljs')
const exec = sh.exec
const which = sh.which

const utils = require('../utils')
const getDirsInfo = utils.getDirsInfo
const buildCourseList = utils.buildCourseList
// const checkFileExistsSync = utils.checkFileExistsSync

function Cmd (vorpal, cliConf) {
  // const rcPath = cliConf.rcPath
  const conf = cliConf.initConf
  // const rcFile = cliConf.rcFile
  const cliDir = cliConf.cliDir
  // const coursesPath = path.join(cliDir, conf.coursePath)
  // const buildPath = path.join(cliDir, conf.buildsPath)

  return vorpal
    .command('build', cmdMsg)
    .alias('b')
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
      if (dirsInfos !== false) {
        if (args.options.list === true) {
          let coursesNames = dirsInfos.fList.existingArr
          debug(blue('list option'), args.options)
          self.prompt({
            type: 'checkbox',
            name: 'chosenList',
            message: 'select the dirs you want to build',
            choices: coursesNames
          }, function (result) {
            dirsInfos.fList.existingArr = result.chosenList
            buildCourseList(dirsInfos, self)
            if (which('say')) {
              exec('say builds done, yo')
            }
            return cb()
          })
        } else {
          buildCourseList(dirsInfos, self)
          if (which('say')) {
            exec('say builds done, yo')
          }
          return cb()
        }
      } else {
        debug('dirsinfo = false')
        self.log('no available dir to build')
      }

      cb()
    })
}

module.exports = {Cmd}
