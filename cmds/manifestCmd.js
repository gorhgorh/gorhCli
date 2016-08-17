/* demo command use this file as a base for new ones */
'use strict'
const cmdName = 'Manifest'
const cmdMsg = 'default msg'
const debug = require('debug')(cmdName)
const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
const mag = chalk.magenta

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync
const getCoursesListName = utils.getCoursesListName

function checkIfCoursesExists(coursesArr, srcPath) {
  const missingOnes = []
  _.each(coursesArr, function (file, key) {
    const fileP = path.join(srcPath, file)
    debug('test it', fileP)
    if (checkFileExistsSync(fileP) === false) {
      missingOnes.push(file)
    }
  })
  if (missingOnes.length > 0) return missingOnes
  else return true
}

function makePromptCourseList () {

}

function Cmd (vorpal, cliConf) {
  const rcPath = cliConf.rcPath
  const conf = cliConf.initConf
  const rcFile = cliConf.rcFile
  const cliDir = cliConf.cliDir
  const coursesPath = path.join(cliDir, conf.coursePath)

  return vorpal
  .command('manifest', cmdMsg)
  .alias('man')
  .alias('m')
  // .option('-a, --all', 'make manifest for all courses')
  .option('-s, --single [course]', 'single course, dirname provided as arg')
  .option('-l, --list', 'select a list of dirs')
  .option('-c, --check', 'checks if the dir in the conf are available')
  .action(function (args, cb) {
    debug(blue(cmdName, 'start'))
    debug(blue(cmdName, 'options'), args)
    const self = this
    let coursesNames = []
    if (_.has(args.options, 'single') === true){
      debug('-s option action')
      coursesNames.push(args.options.single)
    // } else if (_.has(args.options, 'list') === true) {
    } else {
      coursesNames = getCoursesListName(conf)
      if (coursesNames === false) {
        self.log('course list not found in config')
        return cb()
      }
      const areCoursesThere = checkIfCoursesExists(coursesNames, coursesPath)
      if (areCoursesThere !== true) {
        // to do, prune the config list
        self.log('some dir are missing in',coursesPath,':', areCoursesThere.join(', '))
        self.log(blue('removing them from the list'))

        let prunedList = _.each(coursesNames, function (courseName) {
          debug(courseName)
          _.each(areCoursesThere, function (val, key) {
            if (val === courseName) debug('match')
          })
        })

        // coursesNames
        // for each coursename in the rc courses obj
        _.each(coursesNames, function (dirName, index) {
          // we check if it is one of the missing one
          _.each(areCoursesThere, function (exluded) {
            debug(exluded, dirName)
            // if yes, delete it
            if (exluded === dirName) coursesNames.splice(index, 1)
          })
        })
        self.log('some dir missing in the src folder have been pruned from the list', areCoursesThere)
      }
    }

    debug('coursesNames', coursesNames, args.options)

    // debug('all config dirs exists')
    if (args.options.check === true) {
      if (areCoursesThere === true) self.log('all config dirs exists')
      else self.log(red('some dirs are missing'), areCoursesThere)
      return cb()
    }

    cb()
  })
}

module.exports = Cmd
