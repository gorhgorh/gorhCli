'use strict'
const XLSX = require('xlsx')
const path = require('path')
const _ = require('lodash')
const fs = require('fs-extra')
const filename = process.argv[2] || './pmpChart.xlsx'
const filePath = path.join(__dirname, filename)
const readOpts = {}

// read from the XLSX file
const workBook = XLSX.readFile(filePath, readOpts)

var sheetName = workBook.SheetNames[0] // get the first sheet name
// console.log(workBook.SheetNames)

var sheetData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]) // get a js Array containing all rows

// function to extract col labels
function getHeadRow (entry) {
  let headRow = []
  _.each(entry, (v, k) => {
    headRow.push(k.replace(/_/g, ' ').replace(/\n/g, ''))
  })
  console.log(headRow)
  return headRow
}

// extraction process !!
function extract () {
  let headRow = getHeadRow(sheetData[0])
  let data = getData()
  return { headRow, data }
}

function getData () {
  var allDataArr = []
  sheetData.forEach((val, index) => {
    let rowArr = []
    _.each(val, (entry, key) => {
      console.log(entry, key)
      rowArr.push(entry)
    })
    allDataArr.push(rowArr)
  })
  return allDataArr
}

fs.writeJsonSync('./table.json', extract(), 'utf-8')

module.exports = extract
