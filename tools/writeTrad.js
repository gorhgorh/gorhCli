'use strict'
const debug = require('debug')('gorhCli:writeTrad')

const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const nb = require('node-beautify')

// const tradObj = {}

/**
 * create an object for lodash template from a translation.json array
 *
 * @param {Array} arr array of translated pair, [{key: value},...]
 * @param {Object} obj
 * @returns
 */
function makeTrO (arr, obj) {
  if (!obj) obj = {}

  _.forEach(arr, function (o, k) {
    _.forEach(o, function (v, k) {
      obj[k] = v
    })
  })

  return obj
}

function replaceFile (tmpl, tradObj) {
  const template = _.template(tmpl)
  return template(tradObj)
}

module.exports = {
  makeTrO,
  replaceFile}

// const tradArr = fs.readJSONSync(path.join(__dirname, '../sandbox/trad/translations/course-00/tradData.json'), 'utf8')
// const template = fs.readFileSync(path.join(__dirname, '../sandbox/trad/translations/course-00/config.json'), 'utf8')
// const demoTrad = makeTrO(tradArr)

// debug(replaceFile(template, demoTrad))
