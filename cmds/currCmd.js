'use strict'
// ✔, ✖
const cmdName = 'mod'
const cmdNameDesc = cmdName // + ' [dirnames...]'
const cmdMsg = 'modifed testCmd'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')

const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')

const trad = require('adapt-node-transaltion')

// const shelljs = require('shelljs')
// const exec = shelljs.exec
// const which = shelljs.which

// const archiver = require('archiver')
// const async = require('async')

const chalk = require('chalk')
const blue = chalk.cyan
// const red = chalk.red
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
  debug(conf)
  debug(courseName)
  const trDir = conf.initConf.tradFolder || 'trads'
  const fileNames = [
    'config.json',
    'en/course.json',
    'en/contentObjects.json',
    'en/articles.json',
    'en/blocks.json',
    'en/components.json'
  ]
  const srcP = path.join(conf.cliDir, conf.initConf.coursePath, courseName)
  const trP = path.join(conf.cliDir, trDir, courseName)
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
  // debug(files)
  _.each(files, function (file) {
    // debug(file.type)
    treatFile(file, tArr)
  })
  debug(tArr)
}

function treatFile (file, tArr) {
  const fileData = fs.readJsonSync(file.fPath)
  let modObj
  debug(file)
  switch (file.type) {
    case 'config':
      debug(blue('config'))
      fs.writeJsonSync(file.tPath, trad.transConf(fileData, tArr))
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
  // get the configuration file
  debug(blue('start modified cmd'))
  const self = this
  const conf = self.parent.iConf || getConf()

  const opts = args.options
  const cliDir = conf.rcPath || process.cwd()
  const cPath = conf.initConf.coursePath || 'src'

  const srcPath = path.join(cliDir, cPath)

  // get the list of the dirs in the src dir
  const dirList = listDirs(srcPath)
  debug(dirList)
  // debug(conf.isFromInit)

  if (dirList.length < 1 || dirList === false) {
    self.log(blue('no dir in src', srcPath))
  } else if (dirList.length < 2) {
    debug('single course')
    extractTrad(dirList[0], conf)
  } else {
    debug('multiple courses')
    debug(dirList.join('\n'))
    _.each(dirList, function(dir) {
      extractTrad(dir, conf)
    })
  }

  const cmdOpt = {
    noPrompts: false,
    initList: {
      baseFileCopy: false,
      gitInit: true,
      npmInit: false,
      // rcInit: true,
      // adapt: false,
      standard: false
    }
  }
  // debug(conf)
  // alter default conf depenfing on cmd options
  if (opts.noPrompts === true) cmdOpt.noPrompts = true
  if (opts.adapt === true) cmdOpt.initList.adapt = true
  if (opts.standard === true) cmdOpt.initList.standard = true

  // if build all option
  if (opts.all === true) {
    debug('all')
  } else {
    // else if clear all builds
  }
// return cb()
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('t')
    .option('-a, --all', 'all option on, no prompt')
    // .option('-d, --adapt', 'initialise an adapt repo')
    .option('-s, --standard', 'install standard.js')
    .option('-n, --noPrompts', "use default options, don't show prompts")
    .action(cmdAction)
    .hidden()
}
