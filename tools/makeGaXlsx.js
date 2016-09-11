'use strict'
const debug = require('debug')('gorhCli:' + 'makeXlsx' + 'Cmd')
debug('starting xlsx genration')
const fs = require('fs-extra')
const path = require('path')
const xlsx = require('xlsx')
const testData = fs.readJsonSync(path.join(__dirname, '../sandbox/trad/translations/course-00/tradData.json'))
// debug(testData)
