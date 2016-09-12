'use strict'
const cmdName = 'trad write'
const cmdNameDesc = cmdName // + ' [dirnames...]'
const cmdMsg = 'write transalted json for courses'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')

const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')

const wrTrad = require('../tools/writeTrad')
const makeTrO = wrTrad.makeTrO
const replaceFile = wrTrad.replaceFile

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
const green = chalk.green

const utils = require('../utils')
const cfes = utils.checkFileExistsSync
const listDirs = utils.listDirs

const confMan = require('../confMan')
const getConf = confMan.getConf

function writeTrad (courseName, conf, self) {
  const trDir = conf.initConf.tradOutFolder || 'translations/out'

  const srcP = path.join(conf.rcPath, conf.initConf.tradFolder, courseName)
  const trP = path.join(conf.rcPath, trDir, courseName)

  if (cfes(path.join(srcP, 'tradData.json')) !== true) {
    debug(blue('no tradData.json file'))
    return false
  }

  const tradObj = makeTrO(fs.readJsonSync(path.join(srcP, 'tradData.json')))

  const fileNames = [
    'config.json',
    'en/course.json',
    'en/contentObjects.json',
    'en/articles.json',
    'en/components.json'
  ].filter(function (file) {
    const isFileExists = cfes(path.join(srcP, file))
    debug(file, blue('exists', isFileExists))
    return cfes(path.join(srcP, file))
  })
  if (fileNames.length < 1) {
    debug(red('no file to write, return'))
    // self.log(blue('no file to translate'))
    return false
  }
  fs.ensureDirSync(path.join(trP, 'en'))

  const files = fileNames.map(function (fName) {
    const type = path.basename(fName).split('.')[0]
    const fPath = path.join(srcP, fName)
    const tPath = path.join(trP, fName)
    const entry = {type, fPath, tPath}
    debug(entry)
    return entry
  })

  _.each(files, function (file) {
    self.log(blue('starting', file.type))
    var isSucces = treatFile(file, tradObj)
    if (isSucces !== true) {
      self.log(red('Error in'), file.type, isSucces)
    } else {
      self.log(blue('No Errors in'), file.type, green(isSucces))
    }
  })
}

function treatFile (file, tradObj) {
  const tmpl = fs.readFileSync(file.fPath)
  let replaced
  let err
  try {
    replaced = replaceFile(tmpl, tradObj)
  } catch (error) {
    debug(red('arrrrr'))
    replaced = false
    err = error
    return err
  }
  fs.writeFileSync(file.tPath, replaced)

  return true
}

function cmdAction (args, cb) {
  const cmdOpt = {
    all: false
  }
  const opts = args.options
  // alter default conf depenfing on cmd options
  if (opts.all === true) cmdOpt.all = true

  // get the configuration file
  debug(blue('start extraction cmd'))
  const self = this
  const conf = self.parent.iConf || getConf()
  self.log(blue('start translation extraction'))

  const cliDir = conf.rcPath
  const cPath = conf.initConf.tradFolder || 'translations'

  const srcPath = path.join(cliDir, cPath)

  // get the list of the dirs in the src dir
  let dirList = listDirs(srcPath, /course-/)

  if (dirList.length < 1 || dirList === false) {
    // if there is no dir in path
    self.log(blue('no dir in src', srcPath))
    cb()
  } else if (dirList.length < 2) {
    // if there is only one dir
    debug('single course')
    writeTrad(dirList[0], conf, self)
    self.log(blue('finished extracting'))
  } else if (cmdOpt.all === true) {
    // if the all flag is on
    debug('all courses')
    debug(dirList.join('\n'))
    _.each(dirList, function (dir) {
      self.log(blue('treating', dir))
      writeTrad(dir, conf, self)
      self.log(blue('extraction done:', dir))
    })
    self.log(blue('finished extracting'))
  } else {
    // if there are more than one dir, propmts a list
    self.prompt({
      type: 'checkbox',
      name: 'chosenList',
      message: 'select the dirs you want to extract',
      choices: dirList
    }, function (result) {
      if (result.chosenList < 1) {
        self.log(blue('empty selection, please chose a course folder to translate'))
        return cb()
      }
      _.each(result.chosenList, function (dir) {
        self.log(blue('treating', dir))
        writeTrad(dir, conf, self)
        self.log(blue('extraction done:', dir))
      })
      self.log(blue('finished extracting'))
    })
  }
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('tw')
    .option('-a, --all', 'all courses, no prompt')
    // .option('-x, --xls', 'generate xlsx file for tran')
    .action(cmdAction)
// .hidden()
}
