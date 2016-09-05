/* jshint -W079 */
'use strict'
const debug = require('debug')('gorhCli:manifestMod')
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const cmpTmpl = require('./treatManifest')

const chalk = require('chalk')
const green = chalk.green
const blue = chalk.cyan

/**
 * iterate through the provided courses array, building imf manifests
 *
 * @param {array} courses array containing imsManifest config objects
 * @param {string} dest destination path
 * @param {object} self vorpal object, mainly for logs
 */
function makeMans (courses, dest, self) {
  _(courses).forEach(function (course) {
    debug(blue('making manifest for', course.name))
    makeManifest(course, course.name, dest, self)
  })
}

// TODO: add options to pass manifest template file
/**
 * writes imsmanifest file from a template with yesrc's informations
 *
 * @param {object} data object containing ims infos
 * @param {string} key course name
 * @param {string} dest path to builds file to
 * @param {object} self vorpal object, mainly for logs
 */
function makeManifest (data, key, dest, self) {
  const dirPath = path.join(dest, key + '-build')
  fs.ensureDirSync(dirPath)
  fs.writeFileSync(dirPath + '/imsmanifest.xml', cmpTmpl(data))
  self.log(green('done writing'), dirPath + '/imsmanifest.xml')
}

module.exports = makeMans
