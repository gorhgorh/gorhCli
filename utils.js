/* little utilies used everywhere */
'use strict'
const debug = require('debug')('gorhCli:utils')
const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const shelljs = require('shelljs')
const which = shelljs.which
const exec = shelljs.exec
const ln = shelljs.ln
const mv = shelljs.mv
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
 * check if a given path is a symlink or not
 *
 * @param {string} path to test
 * @returns {bool}
 */
function isDirSymlink (dir) {
  const rPath = fs.realpathSync(dir)
  if (rPath !== dir) return true
  else {
    debug(blue('realpath'), rPath)
    return false
  }
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
 * check if dirs provided in the dirs array exists at the given path
 *
 * @param {array} dirs dirctory of strings, names of the dirs
 * @param {string} pth base path to search dir at
 * @returns {object} contain 2 key existingArr and missingArr
 */
function filterExistingDirs (dirs, pth) {
  if (!pth) pth = ''
  debug(blue('checking exisiting dirs'))
  let existingArr = []
  let missingArr = []

  _.each(dirs, function (dir) {
    if (checkFileExistsSync(path.join(pth, dir)) === true) {
      existingArr.push(dir)
    } else {
      missingArr.push(dir)
    }
  })

  if (missingArr.length < 1) missingArr = false
  if (existingArr.length < 1) existingArr = false
  return {existingArr, missingArr}
}

/**
 * get the list of courses from the conf
 * and return the ones that are available
 *
 * @param {object} conf rc conf
 * @param {string} path to the root proj dir
 * @returns {array} array of
 */
function getDirsInfo (conf, cliDir) {
  debug(blue('getListDir Start'))

  const srcPath = path.join(cliDir, conf.coursePath)
  const buildPath = path.join(cliDir, conf.buildsPath)
  const filteredDirs = {}
  filteredDirs.dirO = {}

  const courses = getCoursesList(conf)
  if (courses === false) {
    debug('no valid courses list')
    return false
  }

  _.each(courses, function (val, key) {
    filteredDirs.dirO[val.name] = val
  })

  const dirlist = getCoursesListNames(courses)
  filteredDirs.fList = filterExistingDirs(dirlist, srcPath)
  debug(blue('filtered dirs'), filteredDirs.fList)
  if (filteredDirs.fList.existingArr === false) {
    debug('no valid courses list')
    return false
  }
  filteredDirs.srcPath = srcPath
  filteredDirs.buildPath = buildPath
  return filteredDirs
}

/**
 * link a the src folder to the tar one, from the srcPath dir
 *
 * @param {string} srcDir origin folder
 * @param {string} tarDir symlink
 * @param {string} srcPath path where the link should be
 * @param {bool} overwrite, (optional default true), overwrite the existing symlink
 * @returns {bool} wherever it succed or not
 */
function symCourse (srcDir, tarDir, srcPath, overwrite) {
  debug(blue('start symcourse'))
  // check if the tar dir exists, return false if yes
  if (checkFileExistsSync(path.join(srcPath, srcDir)) !== true) {
    debug(red('src does not exist'))
    return false
  }
  // check if the src dir is a file, return false if yes
  debug(green('src exists'))
  const isDir = fs.statSync(path.join(srcPath, srcDir)).isDirectory()
  if (isDir !== true) {
    debug(red('src is not a dir'))
    return false
  }
  debug(green('src is a dir'))

  // change cwd to srcPath
  const prevDiv = process.cwd()
  try {
    process.chdir(srcPath)
    debug(blue('New directory: '), process.cwd())
  } catch (err) {
    debug(blue('chdir:'), srcDir, err)
    return false
  }

  // if src does not exists
  if (checkFileExistsSync(srcDir) === false) {
    debug(blue('symlink does not exist'))
    try {
      debug(blue('New directory: '), process.cwd())
    } catch (err) {
      debug('chdir:', srcDir, err)
      debug(blue('changing back cwd to:'), prevDiv)
      process.chdir(prevDiv)
      return false
    }

    debug('cwd, src, tar:', process.cwd(), srcDir, tarDir)
    ln('-sf', srcDir, tarDir)
    debug('link created', checkFileExistsSync(srcDir))
  // src exists
  } else {
    const isSrcSymlink = isDirSymlink(srcDir)
    debug(blue('src dir exist'))
    // return false if is it not a symlink
    if (isSrcSymlink !== true) {
      debug('src dir', srcDir, 'is a real directoy')
      debug(blue('changing back cwd to:'), prevDiv)
      process.chdir(prevDiv)
      return false
    // it is a symlink
    } else {
      debug(blue('src dir', srcDir, 'is a symlink'))
      debug(blue('overwrite arg:'), overwrite)
      // overwrite
      if (overwrite === undefined || overwrite === true) {
        debug(blue('overwrite start'))
        ln('-sf', srcDir, tarDir)
        debug(blue('link created'), srcDir, blue('=>'), tarDir)
      // do no overwrite
      } else {
        debug(blue('no overwrite'))
        debug(blue('changing back cwd to:'), prevDiv)
        process.chdir(prevDiv)
        return false
      }
    }
  }

  debug(blue('changing back cwd to:'), prevDiv)
  process.chdir(prevDiv)
  debug(green('symCourse done'))
  return true
}

/**
 * read the given path and return an array containig all directories name
 * if a regex is provided, if filter the dirlist by it
 *
 * @param {string} dirsPath
 * @param {regex} regex
 * @returns {array}
 */
function listDirs (dirsPath, regex) {
  return fs.readdirSync(dirsPath).filter(function (file) {
    // debug(file)
    // debug('file', file, 'reg', regex, 'match', file.match(regex))
    if (fs.statSync(path.join(dirsPath, file)).isDirectory() === true) {
      if (regex) {
        if (file.match(regex) !== null) {
          debug('match', file)
          return true
        }
        // debug('do not match:regex', file, regex)
        return false
      }
      // debug('match:isdir')
      return true
    }
    return false
  })
}

function buildCourseList (dirsInfos, self) {
  debug(red('start buildCourseList'), dirsInfos)
  debug(dirsInfos)
  if (dirsInfos.fList.existingArr === false) {
    debug('no matching dir to build un src folder')
    return false
  }
  const srcPath = dirsInfos.srcPath
  const buildPath = dirsInfos.buildPath
  // const dirObjects = dirsInfos.dirO
  const fileList = dirsInfos.fList.existingArr

  fs.ensureDirSync(buildPath)
  self.log(blue('Starting building courses:'), fileList.join(', '))
  _.each(fileList, function (file) {
    const courseInfo = {
      courseName: file,
      srcPath,
      buildPath
    }
    buildCourse(courseInfo, self)
    self.log(green('Built'), courseInfo.courseName)
  })
  // symCourse('course', 'course-01', srcPath)
}

function buildCourse (courseInfo, self) {
  if (isCmdAvail(['grunt']) === false) {
    debug('no grunt')
    return false
  }
  debug(blue('Start buildCourse:'), courseInfo.courseName)

  debug(courseInfo)
  const srcPath = courseInfo.srcPath
  const buildPath = courseInfo.buildPath
  const courseName = courseInfo.courseName
  symCourse(courseName, 'course', srcPath)

  self.log(blue('Start buildCourse'), courseInfo.courseName)
  if (exec('grunt build', {silent: true}).code !== 0) {
    debug(red('Error: grunt cmd failed'))
    return false
  }
  debug(blue('grunt ran for', courseInfo.courseName))
  const mvPath = path.join(buildPath, courseName)
  const buildSrcPath = path.join(buildPath, '../build')

  mv(buildSrcPath, mvPath)
  debug(green('course built:'), courseName)
}

function makePromtChoices (dirPathArr) {
  const dirPO = {}
  const dirPA = []

  _.each(dirPathArr, function (val) {
    const keyName = val.split('/').pop()
    console.log(keyName, val)
    dirPO[keyName] = val
    dirPA.push(keyName)
  })

  return {dirPO, dirPA}
}

module.exports = {
  checkFileExistsSync,
  clearDir,
  getCoursesList,
  getCoursesListName,
  isCmdAvail,
  checkDirs,
  getDirsInfo,
  checkDeps,
  symCourse,
  isDirSymlink,
  buildCourseList,
  buildCourse,
  listDirs,
  filterExistingDirs,
  makePromtChoices
}
