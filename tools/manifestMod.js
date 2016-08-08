/* jshint -W079 */
var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var cmpTmpl = require('./treatManifest')

function doIt (config, dest) {
  _(config.courses).forEach(function (data, key) {
    makeBuild(data, key, dest)
  })
}

function makeBuild (data, key, dest) {
  console.log('makebuild RAN')
  var dirPath = path.join(dest, key)
  function writeFile () {
    fs.writeFile(dirPath + '/imsmanifest.xml', cmpTmpl(data), function (err) {
      if (err) { throw (err) }
      console.log('done writing', dirPath)
    })
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdir(dirPath, function (err) {
      if (err) { return console.error(err) }
      console.log('Directory', dirPath, 'created successfully!')
      writeFile()
    })
  } else { writeFile() }
}

module.exports = doIt
