/* little utilies used everywhere */
'use strict'
const fs = require('fs-extra')
const path = require('path')

const cliPath = __dirname
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
