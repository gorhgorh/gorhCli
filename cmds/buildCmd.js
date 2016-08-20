/* demo command use this file as a base for new ones */
'use strict'
const cmdName = 'build'
const cmdMsg = 'default msg'
const debug = require('debug')(cmdName)
const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
const green = chalk.green
const mag = chalk.magenta

const utils = require('../utils')
const isCmdAvail = utils.isCmdAvail
const getCoursesList = utils.getCoursesList
const checkFileExistsSync = utils.checkFileExistsSync

const srcDir = 'course'
const tarDir = 'course-03'
const srcPath = '/Users/jloi/code/myTools/gorhCli/sandbox/testDir/src'
var link = require('fs-symlink')

/**
 * check if a dir is a symlink
 *
 * @param {any} dir
 * @returns
 */
function isDirSymlink (dir) {
  const rPath = fs.realpathSync(dir)
  debug(blue('realpath'), rPath)
  if (rPath !== dir) return true
  else return false
}

/**
 * link a the src folder to the tar one, from the srcPath dir
 *
 * @param {string} srcDir origin folder
 * @param {string} tarDir symlink
 * @param {string} srcPath path where the link should be
 * @param {bool} optional, default truen, overwrite the existing symlink
 * @returns {bool} wherever it succed or not
 */
function symCourse (srcDir, tarDir, srcPath, overwrite) {
  debug(blue('start symcourse'))
  // check if the tar dir is a file, return false if yes
  if (checkFileExistsSync(path.join(srcPath, tarDir)) !== true) {
    debug(red('tar does not exist'))
    return false
  }
  // check if the tar dir exists, return false if yes
  debug(green('tar exists'))
  const isDir = fs.statSync(path.join(srcPath, tarDir)).isDirectory()
  if (isDir !== true) {
    debug(red('tar is not a dir'))
    return false
  }
  debug(green('tar is a dir'))

  // change cwd to srcPath
  const prevDiv = process.cwd()
  try {
    debug(blue('changing cwd to:'), srcPath)
    process.chdir(srcPath)
    debug(blue('New directory: '), process.cwd())
  } catch (err) {
    debug(blue('chdir:'), srcDir, err)
    debug(blue('changing back cwd to:'), prevDiv)
    process.chdir(prevDiv)
    return false
  }

  var isSrcSymlink
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
    link(tarDir, srcDir).then(function () {
      debug('link created', checkFileExistsSync(srcDir))
    })
  // symlink exists
  } else {
    isSrcSymlink = isDirSymlink(srcDir)
    debug(blue('src dir exist'))
    // return false if is it not a symlink
    if (isSrcSymlink !== true) {
      debug('src dir', srcDir, 'is a real directoy')
      debug(blue('changing back cwd to:'), prevDiv)
      process.chdir(prevDiv)
      return false
    // if it is a symlink
    } else {
      debug(blue('src dir', srcDir, 'is a symlink'))
      debug('overwrite', overwrite)
      // overwrite
      if (overwrite === undefined || overwrite === true) {
        debug(blue('overwrite start'))
        link(tarDir, srcDir).then(function () {
          debug('link created', checkFileExistsSync(srcDir))
        })
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

symCourse(srcDir, tarDir, srcPath)

function Cmd (vorpal, cliConf) {
  // const rcPath = cliConf.rcPath
  const conf = cliConf.initConf
  // const rcFile = cliConf.rcFile

  return vorpal
    .command(cmdName, cmdMsg)
    .alias('b')
    .action(function (args, cb) {
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
      if (_.has(conf, 'courses') !== true) {
        self.log('not valid configuration, please make one with the rc command')
        cb()
      } else {
        let coursesArr = getCoursesList(conf)
        let coursesList
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
    }
  )
}

module.exports = {
  Cmd,
  symCourse
}
