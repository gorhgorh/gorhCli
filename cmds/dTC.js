'use strict'
// ✔, ✖
const cmdName = 'DANS TON Cucurbitacé'
const cmdNameDesc = cmdName // + ' [dirnames...]'
const cmdMsg = 'modifed rcCmd'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')

const xlsxTradToJson = require('../tools/xlstTradToJson')

const path = require('path')
// const _ = require('lodash')
const fs = require('fs-extra')
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
// const checkFileExistsSync = utils.checkFileExistsSync
// const checkDeps = utils.checkDeps
// const filterExistingDirs = utils.filterExistingDirs
// const makePromtChoices = utils.makePromtChoices
const listDirs = utils.listDirs
// const symCourse = utils.symCourse

const confMan = require('../confMan')
const getConf = confMan.getConf

function cmdAction (args, cb) {
  // get the configuration file
  const self = this
  self.log(blue('starting', cmdName))
  const conf = self.parent.iConf || getConf()

  const cPath = path.join(conf.rcPath, conf.initConf.tradFolder)
  // debug(conf.cliDir)

  const directories = listDirs(cPath)


  const opts = args.options
  const cliDir = process.cwd()
  debug(cliDir, opts)

  self.prompt({
    type: 'list',
    name: 'chosenList',
    message: 'select the dirs you make JSON for',
    choices: directories
  }
  , function (result) {
    debug(result)
    const pathToXlsx = path.join(cPath, result.chosenList)



    // const jsonOut = xlsxTradToJson(pathToXlsx, 'adapt-text', '')


    // xlsxTradToJson()
    const xlsxArr = []
    fs.walk(pathToXlsx)
      .on('data', function (item) {
        if (path.parse(item.path).ext === '.xlsx') {
          xlsxArr.push(item.path)
        }
      })
      .on('end', function () {
        debug(xlsxArr)
        self.prompt({
          type: 'list',
          name: 'chosenXlsx',
          message: 'select the dirs you make JSON for',
          choices: xlsxArr
        }
        , function (result) {
          // const jsonOut = xlsxTradToJson(result.chosenXlsx, 'adapt-text', '')

          // debug(path.join(conf.initConf.rcPath, conf.initConf.tradEditFolder))
          const trPath = path.join(conf.rcPath, conf.initConf.tradEditFolder)
          fs.ensureDirSync(trPath)
          debug(result.chosenXlsx)
          // debug(path.join(trPath, 'lang_en', 'trad_en.json'))

          xlsxTradToJson(result.chosenXlsx, 'adapt-text', path.join(trPath, 'lang_en', 'trad_en.json'))
          // cb()
        })
      })

    // cb()
  })

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
    .alias('dtc')
    .option('-a, --all', 'all option on, no prompt')
    // .option('-d, --adapt', 'initialise an adapt repo')
    .option('-s, --standard', 'install standard.js')
    .option('-n, --noPrompts', "use default options, don't show prompts")
    .action(cmdAction)
    // .hidden()
}
