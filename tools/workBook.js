'use strict'
const debug = require('debug')('gorhCli:workBook')

const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const XLSX = require('xlsx')
// const assert = require('assert')
const workbook = XLSX.readFile('testWebvtt.xlsx')
const sheetNameList = workbook.SheetNames

var isEq = require('is-equal');

const defaultSheetNames = [ 'adapt-text', 'video_transcripts', 'texte_overlay_video', 'texte_jpg_ou_pdf' ]

const webVttHeader = [
  'FILE',
  'TYPE',
  'TC IN',
  'TC OUT',
  'SOURCE',
  'TARGET',
  'AXA CORRECTIONS TARGET',
  'WORDCOUNT SOURCE',
  'WORDCOUNT TARGET',
  'CHARCOUNT SOURCE',
  'CHARCOUNT TARGET' ]

function checkWorkbook(wb, crit){
  crit = (typeof crit !== 'undefined') ? crit : {}
  debug('criterias', crit)

  const checkList = {
    cheetNames:false,
    allSheet:false
  }

  const sheetNameList = workbook.SheetNames
  const checkSheetNames = crit.checkSheetNames || defaultSheetNames
  if (isEq(sheetNameList, checkSheetNames) !== true) {
    debug('sheetNames does not match')
  } else {
    checkList.cheetNames = true
    checkList.allSheet = true
  }

  debug(_.every(checkList, true))
  debug(checkList)
  const isAllTrue = Object.keys(checkList).every(function(key) {
    return checkList[key];
  })

  return {
    type:'wb',
    isOk : isAllTrue,
    checkList
  }
}

function checkSheet (sheet, crit) {
  crit = (typeof crit !== 'undefined') ? crit : {}

  const sheetH = Object.keys(sheet[1])

  debug('criterias', crit, sheetH)

  const checkList = {
    isHeaderMatching:false,
  }

  const sheetNameList = workbook.SheetNames
  const checkSheetNames = crit.checkSheetNames || defaultSheetNames


  if (isEq(sheetH, crit.header) !== true) {
    debug('sheetNames does not match')
  } else {
    checkList.isHeaderMatching = true
  }

  const isAllTrue = Object.keys(checkList).every(function(key) {
    return checkList[key];
  })

  return {
    type:'sheet',
    isOk : isAllTrue,
    checkList
  }
}

function extractSheet (wb, sheetName) {

  const curSheet = wb.Sheets[sheetName]

  return XLSX.utils.sheet_to_json(curSheet)
  // debug(XLSX.utils.sheet_to_json(curSheet))
}

function makeWebVtt (data) {
  debug(data)
}

function extractSheetFromFile (file, sheetName) {
  const workbook = XLSX.readFile(file)
  const data = extractSheet(workbook, sheetName)
  return data
}

// console.log(checkWorkbook(workbook))
// makeWebVtt(extractSheet(workbook, 'video_transcripts'))
// debug(checkSheet(extractSheet(workbook, 'video_transcripts'), {header:webVttHeader}))


module.exports = {
  checkWorkbook,
  checkSheet,
  extractSheet,
  extractSheetFromFile
}
