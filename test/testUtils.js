/* little utilies used everywhere */
'use strict'
const testName = 'utils'
const debug = require('debug')('gorhCli:test:' + testName)
const fs = require('fs-extra')
const path = require('path')

const cliPath = __dirname
debug('star test for', testName)
/**
 * create directories for the test to be ran
 *
 * @param {any} path
 * @param {any} dirs
 */
function createTestDirs (pth, dirs) {
  fs.copySync(path.join(cliPath, '../sandbox/base'), path.join(cliPath, '/testBuild'))
}

module.exports = {
  createTestDirs
}
