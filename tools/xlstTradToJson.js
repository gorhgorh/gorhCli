const debug = require('debug')('gorhCli:extractTable')
const XLSX = require('xlsx')
const fs = require('fs-extra')

/**
 * take an axa xls file and aoutput json file fro translation write
 *
 * @param {String} file name of the xlsx file
 * @param {String} sheetName name of the sheet to extract
 * @pathToOut {String} pathToOut path to write the function to
 */
function xlsToJson (file, sheetName, fileToOut) {
  debug(file, sheetName, fileToOut)
  const workbook = XLSX.readFile(file)

  const jsonSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
  const tradJson = jsonSheet.map(function (entry) {
    const item = {}
    item[entry.REFERENCE] = entry.TARGET
    return item
  })
  debug(workbook)
  fs.ensureFileSync(fileToOut)
  fs.writeJSONSync(fileToOut, tradJson)
  // const sheetRef = workbook.Sheets[sheet]
}

module.exports = xlsToJson
