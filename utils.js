/* little utilies used everywhere */
'use strict'
// checks is a file exist
const fs = require('fs')
function checkFileExistsSync (filepath) {
  let flag = true
  try {
    fs.accessSync(filepath, fs.F_OK)
  } catch (e) {
    flag = false
  }
  return flag
}

module.exports = {checkFileExistsSync}
