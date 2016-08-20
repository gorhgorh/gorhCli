/* little utilies used everywhere */
'use strict'
const debug = require('debug')('utils')
const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')

const shelljs = require('shelljs')
// const sh = require('./shellCmds')
const which = shelljs.which
// const getCliPath = sh.getCliPath

const chalk = require('chalk')
const red = chalk.red
const blue = chalk.cyan
const green = chalk.green
// const mag = chalk.magenta

/**
 * checks is a file exist
 *
 * @param {string} filepath path to the file to check
 * @returns {bool} true if the file exists, else false
 */
function checkFileExistsSync (filepath) {
  let flag = true
  try {
    fs.accessSync(filepath, fs.F_OK)
  } catch (e) {
    flag = false
  }
  return flag
}

/**
 * check if a given command is in the path using 'which'
 *
 * @param {string} cmd command to test
 * return {obj, null} shell js obj or null if not found
 */
function isCmdAvail (cmd) {
  const test = which(cmd)
  return test
}

/**
 * return an array of the course info from the conf
 *
 * @param {object} conf rc conf files
 * @returns {array, bool} an array object, or false
 */
function getCoursesList (conf) {
  if (_.has(conf, 'courses') !== true) {
    debug('not valid conf')
    return false
  } else {
    return conf.courses
  }
}

/**
 * return an array of the dir names of the courses key
 *
 * @param {object} conf rc conf files
 * @returns {array, bool} an array of dirnames, or false
 */
function getCoursesListName (conf) {
  const courseNames = []
  const courseList = getCoursesList(conf)
  if (courseList === false) return false

  _.each(courseList, function (o) {
    courseNames.push(o.name)
  })

  return courseNames
}

/**
 *
 * remove everything, no confirm, at your own risks
 *
 * @param {string} dir path to erase
 * @returns {bool} true if sucessfull
 */
function clearDir (dir) {
  fs.emptyDirSync(dir)
  return true
}

function checkDirs (dirs, pth) {
  debug(blue('checking exisiting dirs'))
  const notFoundArr = dirs.filter(function (dir) {
    if (checkFileExistsSync(path.join(pth, dir)) === true) {
      return false
    } else {
      return true
    }
  })
  if (notFoundArr.length > 0) {
    debug(red('missing dirs in '), path, red(':'), notFoundArr)
    return notFoundArr
  } else {
    debug(green('all dir matches'))
    return true
  }
}

// const theDirs = ['course-01', 'course-02', 'course-03']
// const thePath = '/Users/jloi/code/myTools/gorhCli/sandbox/base/src/'
// checkDirs(theDirs, thePath)

module.exports = {
  checkFileExistsSync,
  clearDir,
  getCoursesList,
  getCoursesListName,
  isCmdAvail,
  checkDirs
}
