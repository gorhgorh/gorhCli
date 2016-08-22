/* little utilies used everywhere */
'use strict'
const debug = require('debug')('gorhCli:utils')
const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
var link = require('fs-symlink')
const shelljs = require('shelljs')
const which = shelljs.which
// const sh = require('./shellCmds')
// const getCliPath = sh.getCliPath

const chalk = require('chalk')
const red = chalk.red
const blue = chalk.cyan
const green = chalk.green
// const mag = chalk.magenta

// default required commands
const requiredCmds = ['git', 'node', 'npm']

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
  if (test === null) return false
  else return true
}

/**
 * checks a provided array of shell commands, if they all are available returns true
 *
 * @param {array} array of string, each string representing a cmd to test
 * @returns {bool} true if all met, array of missing cmds if fails
 */
function checkDeps (deps) {
  if (!deps) deps = requiredCmds
  debug(blue('cheking dependencies'), deps)
  const missingArr = []
  _.each(deps, function (cmd) {
    if (isCmdAvail(cmd) === false) missingArr.push(cmd)
  })
  if (missingArr.length > 0) {
    debug(red('missing commands'), missingArr)
    return missingArr
  } else return true
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

/**
 * return an array of the dir names of the courses key of the courses arr
 *
 * @param {object} courses array of courese info
 * @returns {array, bool} an array of dirnames, or false
 */
function getCoursesListNames (courses) {
  const courseNames = []
  _.each(courses, function (o) {
    courseNames.push(o.name)
  })
  return courseNames
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

/**
 * get the list of the available directories
 *
 * @param {object} conf rc conf
 * @param {object} opts option (prompt:bool,type:string)
 * @param {object} self vorpal cmd instance
 * @param {function} cb vorpal cmd cb
 * @returns
 */
function getDirList (conf, opts, self, cb) {
  debug('getListDir Start')
  const dirList = []
  const courses = getCoursesList(conf)
  if (courses === false) {
    debug('no valid courses list')
    return false
  }
  const coursesNames = courses
  debug(courses)

  if (cb) return cb()
  else return dirList
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
  checkDirs,
  getDirList,
  checkDeps
}
