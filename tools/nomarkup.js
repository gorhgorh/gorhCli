
const debug = require('debug')('gorhCli:extractTable')
const XLSX = require('xlsx')
const _ = require('lodash')
const fs = require('fs-extra')
const extractSheet = require('./workBook').extractSheetFromFile
const toTxt = require('html-to-text')
const path = require('path')

var sheetsFile = 'course-08-en-Game_Audio_FR-revised_by_CYT.xlsx'


function noMarkup (file, sheet) {
  'use strict'

  let nameFile = path.basename(file).split('.')
  const extName = nameFile.pop()

  debug(nameFile, extName)
  nameFile = nameFile.join('.')

  'use strict'
  var workbook = XLSX.readFile(file)
  const sheetRef = workbook.Sheets[sheet]

  for (const z in sheetRef) {

    const col = z.substring(0,1)
    if (col === "C") {
      const ref = "E" + z.substring(1)
      const tradString = sheetRef[z].v
      const cleanedString = toTxt.fromString(sheetRef[z].v.replace(/&nbsp;/g, ' '), {uppercaseHeadings: false})
        .replace(/\[([^]]+)\]/g, '') // clean images
        .replace(/\n/g, '\n ') // add a space before new lines  
      sheetRef[ref] = _.clone(sheetRef[z])
      sheetRef[ref].v = cleanedString

    }

  }
  XLSX.writeFile(workbook, nameFile + '_' +  new Date().valueOf() + '.xlsx');
}

noMarkup(sheetsFile, 'adapt-text')

module.exports = noMarkup