'use strict'
const debug = require('debug')('gorhCli:extractTable')
const XLSX = require('xlsx')
const _ = require('lodash')
const fs = require('fs-extra')
const extractSheet = require('./workBook').extractSheetFromFile
const toTxt = require('html-to-text')
const excelbuilder = require('msexcel-builder')

var sheetsFile = 'course-08-en-Game_Audio_FR-revised_by_CYT'+'.xlsx'
var arrayTarget = [];
var i = 0;
var adaptTextTarget = extractSheet(sheetsFile, 'adapt-text').filter(function (entry) {
  var textTargetClean = toTxt.fromString(entry.TARGET.replace(/&nbsp;/g, ' '), {uppercaseHeadings: false})
    .replace(/\[([^]]+)\]/g, '') // clean images
    .replace(/\n/g, '\n ') // add a space before new lines            

  arrayTarget.push(textTargetClean)
  i++; 
   
})


// const defHeader = [
//   'REFERENCE',
//   'SOURCE',
//   'TARGET'
// ]

// const noMk = [
//   'SOURCE /* no-markup */',
//   'TARGET /* no-markup */'
// ]

// const defHeaderTr = [
//   'FILE',
//   'TYPE',
//   'TC IN',
//   'TC OUT',
//   'SOURCE',
//   'TARGET'
// ]

// const defHeaderVids = [
//   'FILE',
//   'TYPE',
//   'SOURCE',
//   'TARGET'
// ]

// const defHeaderJPG = [
//   'FILE',
//   'TYPE',
//   'SOURCE',
//   'TARGET'
// ]

// const addHeader = [
//   'WORDCOUNT SOURCE',
//   'WORDCOUNT TARGET',
//   'CHARCOUNT SOURCE',
//   'CHARCOUNT TARGET'
// ]

// function prepareData (data) {
//   // transform key val to array for createWorkBook func
//   const dataArr = data.map(function (entry) {
//     const entryArr = []
//     const entryName = Object.keys(entry)[0]
//     const entryText = entry[entryName]
//     entryArr.push(entryName)
//     entryArr.push(entryText)
//     // debug(entryArr)
//     return entryArr
//   })
//   // debug(data.length)
//   return dataArr
// }

// function fillSheet (data, sheet) {
//   data.forEach(function (entry, i) {
//     entry.forEach(function (data, dI) {
//       sheet.set(dI + 1, i + 1, data)
//     }, this)
//   }, this)
//   return sheet
// }

// /**
//  * create a workbook from a translation array and writes it down
//  *
//  * @param {Array} initData tranlation array
//  * @param {String} pth a path to write the xlsx to
//  * @param {Array} header an array containing the header's titles
//  * @param {Object} opts cli extraction option object from .gorhclirc
//  */
// function createWorkBook (initData, pth, opts, header) {
//   debug(opts)

//   // apply cmd options
//   // if clientFields opt is true
//   if (opts.makeNoMarkup) {
//     debug('no Markup')
//     defHeader.push(...noMk)
//   }
//   if (opts.useClientFields) {
//     debug('useAdditionalFields: true')
//     if (!opts.clientFields) {
//       debug(red('you need to provide clientsField in the config for this option to work'))
//       return false
//     }

//     defHeader.push(...opts.clientFields)
//     defHeaderVids.push(...opts.clientFields)
//     defHeaderJPG.push(...opts.clientFields)
//     defHeaderTr.push(...opts.clientFields)
//   }
//   // if aditional field opt is true
//   if (opts.useAdditionalFields) {
//     debug('useAdditionalFields: true')
//     defHeader.push(...addHeader)
//     defHeaderVids.push(...addHeader)
//     defHeaderJPG.push(...addHeader)
//     defHeaderTr.push(...addHeader)
//   }
//   // if aditional field opt is true
//   // if (opts.useAdditionalFields) {
//   //   debug('useAdditionalFields: true')
//   //   defHeader.push(...addHeader)
//   //   defHeaderVids.push(...addHeader)
//   //   defHeaderJPG.push(...addHeader)
//   //   defHeaderTr.push(...addHeader)
//   // }

//   if (!header) header = defHeader
//   const baseName = pth.split('/').pop()
//   // Create a new workbook file in current working-path
//   const data = [header, ...prepareData(initData)]
//   const maxRow = data.length
//   const maxCell = data[0].length
//   let fileName = baseName + '-Ga.xlsx'

//   if (cfes(path.join(pth, fileName))) {
//     const revision = require('child_process')
//       .execSync('git rev-parse HEAD')
//       .toString().trim().slice(0, 7)
//     fileName = baseName + '-Ga-' + revision + '.xlsx'
//     if (cfes(path.join(pth, fileName))) {
//       fileName = baseName + '-Ga-' + revision + '##' + new Date().valueOf() + '.xlsx'
//     }
//     debug(revision)

//     // fileName = baseName + '-Ga-' + new Date().valueOf() + '.xlsx'
//   }
//   var workbook = excelbuilder.createWorkbook(pth, fileName)


//   // Create worksheets
//   var sheet1 = workbook.createSheet('adapt-text', maxCell, maxRow)
//   var sheet2 = workbook.createSheet('video_transcripts', defHeaderTr.length, maxRow)
//   var sheet3 = workbook.createSheet('texte_overlay_video', defHeaderVids.length, maxRow)
//   var sheet4 = workbook.createSheet('texte_jpg_ou_pdf', defHeaderJPG.length, maxRow)
//   // fill sheet one with data
//   data.forEach(function (entry, i) {
//     entry.forEach(function (data, dI) {
//       sheet1.set(dI + 1, i + 1, data)
//       if (opts.makeNoMarkup) {
//         // defHeader.push(...noMk)
//         if (dI === 1) {
//           // debug(data)
//           const cleaned = toTxt.fromString(data.replace(/&nbsp;/g, ' '), {uppercaseHeadings: false})
//             .replace(/\[([^]]+)\]/g, '') // clean images
//             .replace(/\n/g, '\n ') // add a space before new lines            
//           sheet1.set(4, i + 1, cleaned)
//         }
//       }
//     }, this)
//   }, this)
//   // prepare other sheets
//   fillSheet([defHeaderTr], sheet2)
//   fillSheet([defHeaderVids], sheet3)
//   fillSheet([defHeaderJPG], sheet4)
//   workbook.save(function (err) {
//     if (err) {
//       throw err
//     } else {
//       debug(blue('xlsx file written in :', pth))
//     }
//   })
// }

// module.exports = createWorkBook
