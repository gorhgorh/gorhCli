'use strict'
const debug = require('debug')('Build')

const chalk = require('chalk')
const red = chalk.red
const blue = chalk.cyan
const green = chalk.green
const mag = chalk.magenta

debug(blue('buildjs, test 0'))

function symCourse (srcDir, courseDir, symDir) {
  if (!symDir) symDir = 'course'
}

module.exports = {symCourse}
