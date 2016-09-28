'use strict'
const debug = require('debug')('gorhCli:writeTrad')
const _ = require('lodash')

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
  debug('trad obj created')
  return obj
}

function replaceFile (tmpl, tradObj) {
  let template
  try {
    template = _.template(tmpl)
  } catch (error) {
    debug(error)
    return false
  }
  return template(tradObj)
}

module.exports = {
  makeTrO,
  replaceFile}
