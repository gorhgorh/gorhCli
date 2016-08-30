/* demo command use this file as a base for new ones */
'use strict'
const cmdName = 'buildCmd'
const cmdMsg = 'builds adapt courses'
const debug = require('debug')('gorhCli:' + cmdName)
const path = require('path')
const fs = require('fs-extra')
// const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
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
  const conf = cliConf.initConf
  const cliDir = cliConf.cliDir

  return vorpal
    .command('build', cmdMsg)
    .alias('b')
    .option('-l, --list', 'select a list of dirs')
    .option('-c, --clear', 'clear the builds directory beforehand')
    .action(function (args, cb) {
      const self = this
      const opts = args.options
      debug(blue(cmdName, 'start'))
      debug(opts)
      // if -c flag clear the builds dir
      if (opts.clear === true) {
        debug(blue('cleaning build dir'))
        fs.removeSync(path.join(cliDir, '/builds'))
      }

      // clean the build dir
      fs.removeSync('./build')

      const dirsInfos = getDirsInfo(conf, cliDir)
      if (getDirsInfo === false) {
        self.log('invalid config')
        return cb()
      }

      debug(blue('dirlistInfos'), dirsInfos)

      // TODO treat list case
      if (dirsInfos !== false) {
        if (opts.list === true) {
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
