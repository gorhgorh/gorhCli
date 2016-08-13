'use strict'
const debug = require('debug')('Build')
var path = require('path')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

debug(blue('buildjs, test 0'))

function symCourse (srcDir, courseDir, symDir) {
  if (!symDir) symDir = 'course'
  const symP = path.join(srcDir, courseDir)
  const symL = path.join(srcDir, symDir)
  debug('symlinky', symP, symL)
}

module.exports = {symCourse}
