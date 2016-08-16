/* command to build adapt courses require grunt */
'use strict'
const debug = require('debug')('Build')
const path = require('path')
const _ = require('lodash')

const confMan = require('../confMan')
const conf = confMan.confManConf

const utils = require('../utils')
const getCoursesList = utils.getCoursesList
const isCmdAvail = utils.isCmdAvail

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
const green = chalk.green
const mag = chalk.magenta

/**
 * create a symbolic link to a course directory
 *
 * @param {any} srcDir
 * @param {any} courseDir
 * @param {any} conf
 * @param {any} symDir
 */
function symCourse (srcDir, courseDir, conf, symDir) {
  if (!symDir) symDir = 'course'
  const symP = path.join(srcDir, courseDir)
  const symL = path.join(srcDir, symDir)
  debug('symlinky', symP, symL)
}

/**
 * function passed to a vorpal command instance
 * it will will propose option to build
 *
 * @param {any} args
 * @param {any} cb
 */
function buildAction (args, cb) {
  const self = this

  // check for dependencies
  // grunt
  debug(blue('checking deps'))
  if (isCmdAvail('grunt') === null) {
    self.log(red('grunt not available'))
    return cb()
  } else {
    debug(mag('grunt cmd available'))
  }
  debug(green('all deps avaiable'))

  // get the courses list from configuration
  // TODO : make a global config system
  let coursesArr = getCoursesList(conf)
  let coursesList
  if (_.has(conf, 'courses') !== true) {
    self.log('not valid configuration, please make one with the rc command')
    cb()
  } else {
    coursesArr = getCoursesList(conf)
    if (coursesArr === false) {
      debug('problem loading the courses list', coursesArr)
      self.log('problem loading the courses list')
      cb()
    } else {
      coursesList = []
      _.each(coursesArr, function (o) {
        coursesList.push(o.name)
      })
      // prompt to select dirs to build
      self.prompt({
        type: 'checkbox',
        name: 'courseList',
        message: 'list directories to build',
        choices: coursesList
      }, function (result) {
        if (result.courseList.length < 1) {
          self.log(red('one, choice, you need to make (at least) ONE choice'))
          return cb()
        }
        self.log(result.courseList)
        cb()
      })
    // debug(coursesList, coursesArr)
    }
  }
// if (args['courses'] !== undefined && args.courses.length < 1) this.log(args.courses.join(' '))
}

module.exports = {
  buildAction,
  symCourse}
