/* demo command use this file as a base for new ones */
'use strict'
const cmdName = 'manifests'
const cmdMsg = 'generate scrorm manifests'
const debug = require('debug')('gorhCli:' + cmdName)
const path = require('path')
// const fs = require('fs-extra')
const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync
const getCoursesListName = utils.getCoursesListName

const makeMans = require('../tools/manifestMod')

/**
 * check id the directories in the coursesArr exist at the givent srcPath
 *
 * @param {array} coursesArr
 * @param {string} srcPath usually source path from config
 * @returns {bool} true if they all exists else array of missing ones
 */
function checkIfCoursesExists (coursesArr, srcPath) {
  const missingOnes = []
  _.each(coursesArr, function (file, key) {
    const fileP = path.join(srcPath, file)
    if (checkFileExistsSync(fileP) === false) {
      missingOnes.push(file)
    }
  })
  if (missingOnes.length > 0) return missingOnes
  else return true
}

function makeManInfoArr (nameArr, coursesArr) {
  const manInfoArr = []
  _.each(nameArr, function (name) {
    _.each(coursesArr, function (data) {
      if (data.name === name) manInfoArr.push(data)
    })
  })
  debug(blue('manInfoArr'), manInfoArr)
  return manInfoArr
}

function Cmd (vorpal, cliConf) {
  // const rcPath = cliConf.rcPath
  const conf = cliConf.initConf
  // const rcFile = cliConf.rcFile
  const cliDir = cliConf.cliDir
  const coursesPath = path.join(cliDir, conf.coursePath)
  const buildPath = path.join(cliDir, conf.buildsPath)

  const autoCompleteArr = []

  // prepare autocomplete array
  _.each(conf.courses, function (course, key) {
    autoCompleteArr.push(course.name)
  })
  return vorpal
    .command('manifest', cmdMsg)
    .alias('man')
    .alias('m')
    .autocomplete(autoCompleteArr)
    // .option('-a, --all', 'make manifest for all courses')
    .option('-s, --single [course]', 'single course, dirname provided as arg')
    .option('-l, --list', 'select a list of dirs')
    .option('-c, --check', 'dry run, checks if the dir in the conf are available')
    .action(function (args, cb) {
      const self = this
      let coursesNames = []
      let areCoursesThere
      self.log(blue('Starting make', cmdName))
      debug(blue(cmdName, 'options'), args)

      if (_.has(args.options, 'single') === true) {
        debug('-s option action')
        if (typeof (args.options.single) === 'boolean') {
          debug(red('you should provide a dirname as -s arg'))
          cb()
        }
        coursesNames.push(args.options.single)
      // } else if (_.has(args.options, 'list') === true) {
      } else {
        coursesNames = getCoursesListName(conf)
        if (coursesNames === false) {
          self.log('course list not found in config')
          return cb()
        }
        areCoursesThere = checkIfCoursesExists(coursesNames, coursesPath)
        if (areCoursesThere !== true) {
          // to do, prune the config list
          self.log(blue('some dir are missing in', coursesPath, ':', areCoursesThere.join(', ')))
          self.log(blue('removing them from the list'))

          // for each coursename in the rc courses obj
          _.each(coursesNames, function (dirName, index) {
            // we check if it is one of the missing one
            _.each(areCoursesThere, function (exluded) {
              // debug(exluded, dirName)
              // if yes, delete it
              if (exluded === dirName) coursesNames.splice(index, 1)
            })
          })
          self.log(blue('some dir missing in the src folder have been pruned from the list :', areCoursesThere.join(', ')))
        }
      }

      // coursesNames list is now available and pruned of non existing dir
      // stop here if it is a dry run
      if (args.options.check === true) {
        if (areCoursesThere === true) self.log('all config dirs exists', coursesNames)
        else self.log(red('some dirs are missing'), areCoursesThere)
        debug(blue('end dry run'))
        return cb()
      }

      if (coursesNames.length < 1) {
        self.log(red('no directory matching the course list'))
        return cb()
      }

      if (args.options.list === true && coursesNames.length > 1) {
        debug('coursesNames', coursesNames, args.options)
        // prompt to make a list of manifest to do
        self.prompt({
          type: 'checkbox',
          name: 'chosenList',
          message: 'select the dirs you want manifest for',
          choices: coursesNames
        }, function (result) {
          coursesNames = result.chosenList
          const manifestInfos = makeManInfoArr(coursesNames, conf.courses)
          debug('desto', buildPath)
          makeMans(manifestInfos, buildPath, self)
          cb()
        })
      } else {
        const manifestInfos = makeManInfoArr(coursesNames, conf.courses)
        debug('desto', buildPath)
        makeMans(manifestInfos, buildPath, self)
        cb()
      }
    })
}

module.exports = Cmd
