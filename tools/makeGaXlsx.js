'use strict'
const debug = require('debug')('gorhCli:' + 'makeXlsx' + 'Cmd')
debug('starting xlsx genration')
const fs = require('fs-extra')
const path = require('path')
const xlsx = require('xlsx')
var excelbuilder = require('msexcel-builder')

const testData = fs.readJsonSync(path.join(__dirname, '../sandbox/trad/translations/course-00/tradData.json'))

const defHeader = [
  'reference',
  'version EN',
  'version ES',
  'version EN /* no-markup */',
  'version ES /* no-markup */'
]

function prepareData (data) {

  // transform key val to array for createWorkBook func
  const dataArr = data.map(function (entry) {
    const entryArr = []
    const entryName = Object.keys(entry)[0]
    const entryText = entry[entryName]
    entryArr.push(entryName)
    entryArr.push(entryText)
    // debug(entryArr) ;
    return entryArr
  })
  // debug(data.length)
  return dataArr
}

/**
 * create a workbook from a translation array and writes it down
 *
 * @param {Array} initData tranlation array
 * @param {String} pth a path to write the xlsx to
 * @param {Array} header an array containing the header's titles
 */
function createWorkBook (initData, pth,  header) {
  if (!header) header = defHeader
  // Create a new workbook file in current working-path
  const data = [header, ...prepareData(initData)]
  const maxRow = data.length
  const maxCell = data[0].length
  var workbook = excelbuilder.createWorkbook(pth, 'tradGa.xlsx')

  // Create a new worksheet with 10 columns and 12 rows
  var sheet1 = workbook.createSheet('adapt-text', maxCell, maxRow)

  data.forEach(function(entry, i) {
    entry.forEach(function(data, dI) {
      sheet1.set(dI + 1, i + 1, data)
      if (dI === 1) {
        // debug(data)
        sheet1.set(dI + 1, i + 1, data)

      }
    }, this);

  }, this);

  workbook.save(function (err) {
    if (err)
      throw err
    else
      debug('congratulations, your workbook created')
  })
}
// createWorkBook(testData, './')

module.exports = createWorkBook

// debug(testData)
