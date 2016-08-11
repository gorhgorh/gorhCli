/* command to build adapt courses require grunt */
'use strict'
const debug = require('debug')('Build')
var path = require('path')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

debug(blue('buildjs, test 1'))

/**
 * create a symbolic link to a course directory
 *
 * @param {any} srcDir
 * @param {any} courseDir
 * @param {any} symDir
 */
function symCourse (srcDir, courseDir, symDir) {
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
  if (args['courses'] !== undefined && args.courses.length < 1) this.log(args.courses.join(' '));
  debug('args', args)
  cb()
}

module.exports = {
  buildAction,
  symCourse
}
