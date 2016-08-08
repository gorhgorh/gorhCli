/* jshint -W079 */
var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var cmpTmpl = require('./treatManifest')

// console.log(configs)
function checkFolder (folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }
  console.log('check folder')
}
// checkFolder(path.join(__dirname, '../imsManifest/dist'))


function doIt (config, dest) {
  console.log('doIt ran')
  _(config.courses).forEach(function (data, key) {
    console.log('for each ran')
    makeBuild(data, key, dest)
  })
}
// doIt()
// console.log(cmpTmpl(cfg))

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
