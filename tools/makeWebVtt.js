'use strict'
const debug = require('debug')('gorhCli:makeWebVtt')

const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')

const handlebars = require('handlebars')
const isEq = require('is-equal')

const extractSheet = require('./workBook').extractSheetFromFile

const webVttTmplStr = `WEBVTT

{{#entries}}
{{@index}}
{{'TC IN'}} --> {{'TC OUT'}}
{{TARGET}}

{{/entries}}
`
const template = handlebars.compile(webVttTmplStr)

function makeWebVttStr (data) {
  // debug(template({entries: data}))
  const out = template({entries: data})
  return out
}

function splitVtt (allVtts) {
  let curVtt = allVtts[0].FILE
  let curArr = []
  const allVttArr = []
  debug('start vtt', curVtt)
  _.each(allVtts, function (entry) {
    entry.TARGET = entry.TARGET.trim()

    if (isEq(curVtt, entry.FILE)) {
      curArr.push(entry)
    } else {
      curVtt = entry.FILE
      debug('New vtt', curVtt)
      if (curVtt === 'undefined' || curVtt === undefined) {
        // TODO : treat case (error, hash, skip, warning ?)
        // switch to self.log in the Cmd version
        console.log('name is undefined in the xlsx, check file')
      }
      allVttArr.push(curArr)
      curArr = []
      curArr.push(entry)
    }
  })
  allVttArr.push(curArr)
  return allVttArr
}

function writeVtts (allVttArr, lang, destPath) {
  fs.ensureDirSync(destPath)

  _.each(allVttArr, function (file) {
    const fileName = file[0].FILE
    const newFileName = `${path.basename(fileName, path.extname(fileName))}.${lang}.vtt`
    const vttData = makeWebVttStr(file)
    fs.writeFileSync(path.join(destPath, newFileName), vttData)
    debug('written', newFileName)
  })
}

/**
 * make webvtt from a templated xls file
 *
 * @param {String} fileP path to the xlsx file
 * @param {String} outP path to write xlsx to
 * @param {String} sheetname name of the sheet to extract vtt from
 * @param {String} lang lang to append in the outname for lang selection
 */
function makeWebVttFromFile (fileP, outP, sheetname, lang) {
  // remove the entries without data
  const filtered = extractSheet(fileP, 'video_transcripts').filter(function (entry) {
    return (_.has(entry, ('SOURCE')))
  })
  writeVtts(splitVtt(filtered), lang, outP)
}

makeWebVttFromFile('testWebvttBig.xlsx', './outVtt/', 'video_transcripts', 'es')

module.exports = makeWebVttFromFile
