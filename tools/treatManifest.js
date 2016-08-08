/* jshint -W079 */
var fs = require('fs')
var _ = require('lodash')
var assert = require('assert')
var path = require('path')
var manifestPath = path.join(__dirname) + '/imsmanifest.xml'

var manifestData = fs.readFileSync(manifestPath, 'UTF-8')
var compiled = _.template(manifestData)

module.exports = function (cfg) {
  // check presence and type of the config obj
  if (!cfg) { throw new Error('you need a config file') }
  assert(typeof cfg === 'object')
  // returns the compiled template
  return compiled(cfg)
}
