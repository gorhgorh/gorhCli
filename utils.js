/* little utilies used everywhere */
'use strict'
const fs = require('fs-extra')

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

module.exports = {
  checkFileExistsSync,
  clearDir
}
