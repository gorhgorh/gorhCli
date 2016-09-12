'use strict'
const cmdName = 'trad extract'
const cmdNameDesc = cmdName // + ' [dirnames...]'
const cmdMsg = 'modifed testCmd'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')

const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')

const trad = require('adapt-node-transaltion')
const makeXlx = require('../tools/makeGaXlsx')

// const shelljs = require('shelljs')
// const exec = shelljs.exec
// const which = shelljs.which

// const archiver = require('archiver')
// const async = require('async')

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync
// const checkDeps = utils.checkDeps
// const filterExistingDirs = utils.filterExistingDirs
// const makePromtChoices = utils.makePromtChoices
const listDirs = utils.listDirs
// const symCourse = utils.symCourse

const confMan = require('../confMan')
const getConf = confMan.getConf

function extractTrad (courseName, conf) {
  const trDir = conf.initConf.tradFolder || 'trads'

  const srcP = path.join(conf.cliDir, conf.initConf.coursePath, courseName)
  const trP = path.join(conf.cliDir, trDir, courseName)

  const fileNames = [
    'config.json',
    'en/course.json',
    'en/contentObjects.json',
    'en/articles.json',
    'en/blocks.json',
    'en/components.json'
  ].filter(function(file){
    const isFileExists = checkFileExistsSync(path.join(srcP, file))
    debug(file, blue('exists', isFileExists))
    return checkFileExistsSync(path.join(srcP, file))
  })

  fs.ensureDirSync(path.join(trP, 'en'))

  const files = fileNames.map(function (fName) {
    const type = path.basename(fName).split('.')[0]
    const fPath = path.join(srcP, fName)
    const tPath = path.join(trP, fName)
    const entry = {type, fPath, tPath}
    debug(entry)
    return entry
  })

  const tArr = []

  _.each(files, function (file) {
    treatFile(file, tArr)
  })

  fs.writeJsonSync(path.join(trP, 'tradData.json'), tArr)
  makeXlx(tArr, trP)
}

function treatFile (file, tArr) {
  const fileData = fs.readJsonSync(file.fPath)
  let modObj
  debug(file)
  switch (file.type) {
    case 'config':
      debug(blue('config'))
      modObj = trad.transConf(fileData, tArr)
      fs.writeJsonSync(file.tPath, modObj.o)
      break
    case 'course':
      debug(blue('course'))
      fs.writeJsonSync(file.tPath, trad.transCourse(fileData, tArr))
      break
    case 'contentObjects':
      debug(blue('contentObjects'))
      fs.writeJsonSync(file.tPath, trad.transPage(fileData, tArr))
      break
    case 'articles':
      debug(blue('contentObjects'))
      fs.writeJsonSync(file.tPath, trad.transArt(fileData, tArr))
      break
    case 'blocks':
      debug(blue('blocks no action (yet)'))
      // fs.writeJsonSync(file.tPath, trad.transPage(fileData, tArr))
      break
    case 'components':
      debug(blue('components'))
      fs.writeJsonSync(file.tPath, trad.transComps(fileData, tArr))
      break
    default:
      debug(red('guru meditation, unKnow type:'), file.type)
      break
  }
}

function cmdAction (args, cb) {
  const cmdOpt = {
    all: false,
  }
  const opts = args.options
  // alter default conf depenfing on cmd options
  if (opts.all === true) cmdOpt.all = true

  // get the configuration file
  debug(blue('start modified cmd'))
  const self = this
  const conf = self.parent.iConf || getConf()
  self.log(blue('start translation extraction'))

  const cliDir = conf.rcPath || process.cwd()
  const cPath = conf.initConf.coursePath || 'src'

  const srcPath = path.join(cliDir, cPath)

  // get the list of the dirs in the src dir
  let dirList = listDirs(srcPath)
  debug(dirList)
  // debug(conf.isFromInit)

  if (dirList.length < 1 || dirList === false) {
    self.log(blue('no dir in src', srcPath))
    cb()
  } else if (dirList.length < 2) {
    debug('single course')
    extractTrad(dirList[0], conf)
    self.log(blue('finished extracting'))
  } else if (cmdOpt.all === true){
    debug('all courses')
    debug(dirList.join('\n'))
    _.each(dirList, function(dir) {
      self.log(blue('treating', dir))
      extractTrad(dir, conf)
      self.log(blue('extraction done:', dir))
    })
    self.log(blue('finished extracting'))
  } else {
    self.prompt({
      type: 'checkbox',
      name: 'chosenList',
      message: 'select the dirs you want to extract',
      choices: dirList
    }, function (result) {
      _.each(result.chosenList, function(dir) {
        self.log(blue('treating', dir))
        extractTrad(dir, conf)
        self.log(blue('extraction done:', dir))
      })
      self.log(blue('finished extracting'))
    })
  }
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('te')
    .option('-a, --all', 'all option on, no prompt')
    .option('-x, --xls', 'generate xlsx file for tran')
    .action(cmdAction)
    // .hidden()
}
