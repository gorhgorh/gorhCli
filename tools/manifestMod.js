/* jshint -W079 */
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const cmpTmpl = require('./treatManifest')

const chalk = require('chalk')
const green = chalk.green

// iterate through the yesrc.cson's courses objects
function makeMans (conf, dest, self) {
  _(conf.courses).forEach(function (data) {
    makeManifest(data, data.name, dest, self)
  })
}

// writes imsmanifest file from a template with yesrc's informations
function makeManifest (data, key, dest, s) {
  var dirPath = path.join(dest, key)
  function writeFile () {
    fs.writeFile(dirPath + '/imsmanifest.xml', cmpTmpl(data), function (err) {
      if (err) { throw (err) }
      s.log(green('done writing'), dirPath)
    })
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdir(dirPath, function (err) {
      if (err) { return console.error(err) }
      s.log(green('Directory', dirPath), 'created successfully!')
      writeFile()
    })
  } else { writeFile() }
}

module.exports = makeMans
