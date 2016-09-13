'use strict'
const debug = require('debug')('gorhCli:writeTrad')

const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')

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
  const template = _.template(tmpl)
  return template(tradObj)
}

module.exports = {
  makeTrO,
  replaceFile}
