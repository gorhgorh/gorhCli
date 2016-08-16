/* demo command use this file as a base for new ones */
'use strict'
const cmdName = 'init'
const cmdMsg = 'initialise the repository'
const debug = require('debug')(cmdName)
// const path = require('path')
// const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync
const isCmdAvail = utils.isCmdAvail

const requiredCmds = ['svn', 'git', 'node', 'npm']
const requiredFiles = ['.git', 'package.json', '.editorConfig', '.gorhCli']

/**
 * cheks a provided array of shell commands, if they all are available returns true
 *
 * @param {array} array of string, each string representing a cmd to test
 * @returns {bool} true if all met, array of missing cmds if fails
 */
function checkDeps (deps) {
  if (!deps) deps = requiredCmds
  debug(blue('cheking dependencies'), deps)
  const missingArr = []
  _.each(deps, function (cmd) {
    if (isCmdAvail(cmd) === null) missingArr.push(cmd)
  })
  if (missingArr.length > 0) {
    debug(red('missing commands'), missingArr)
    return missingArr
  } else return true
}

/**
 * check the provided path for files provided as the second arg (array, optional)
 *
 * @param {string} basePath path to search for file
 * @param {array} filesArr array of string, that are path to file from the root of the project
 * @returns {array} project files found
 */
function checkConfFiles (basePath, filesArr) {
  if (!filesArr) filesArr = requiredFiles
  debug(blue('cheking for project files'), filesArr)
  const projectFilesArr = []
  _.each(filesArr, function (file) {
    const filePath = path.join(basePath, '/', file)
    if (checkFileExistsSync(filePath) === true) {
      projectFilesArr.push(file)
    } else {
      debug(blue('no', file, 'found'))
    }
  // if (isCmdAvail(cmd) === null) missingArr.push(cmd)
  })
  debug(projectFilesArr)
  return projectFilesArr
}

/**
 * init cmd, prompt question to the user and make action depending on these choices
 *
 * @param {any} vorpal
 * @param {any} cliConf
 * @returns {function} vorpal command
 */
function Cmd (vorpal, cliConf) {
  // const rcPath = cliConf.rcPath
  // const conf = cliConf.initConf
  // const rcFile = cliConf.rcFile
  const cliDir = cliConf.cliDir

  return vorpal
    .command(cmdName, cmdMsg)
    .alias('i')
    .option('-d, --dry')
    .option('-y, --yolo')
    .option('-n, --noPrompts')
    .action(function (args, cb) {
      debug(blue(cmdName, 'start'))
      // set default cmd options
      const self = this
      const cmdOpt = {
        isDry: false,
        yolo: false,
        noPrompts: false,
        initList:{
          gitInit: false,
          npmInit: false,
          baseFileCopy: false,
          rcInit: false
        }
      }
      // alter default conf depenfing on cmd options
      if (args.options.dry === true) cmdOpt.isDry = true
      else cmdOpt.isDry = false
      // cmdOpt.isDry = (args.options.dry) ? true : false
      if (args.options.yolo === true) cmdOpt.yolo = true
      else cmdOpt.yolo = false
      // cmdOpt.yolo = (args.options.yolo) ? true : false
      if (args.options.noPrompts === true) cmdOpt.noPrompts = true
      else cmdOpt.noPrompts = false
      // cmdOpt.noPrompts = (args.options.noPrompts) ? true : false

      /**
       * propmpts
       */
      // get the list of file found on the project root (package.json, .gorhrc, etc)
      const projectFilesArr = checkConfFiles(cliDir)

      // build prompt list depending on option and file present in the root dir
      const prompts = []

      // prompts objetcts
      const gitPrompt = {
        type: 'confirm',
        name: 'gitInit',
        default: true,
        message: 'initialise a git repo ?'
      }
      const npmPrompt = {
        type: 'confirm',
        name: 'npmInit',
        default: true,
        message: 'create a package .json ?'
      }
      const basePrompt = {
        type: 'confirm',
        name: 'copyBaseFiles',
        default: true,
        message: 'copy base files ?'
      }

      prompts.push(gitPrompt, npmPrompt, basePrompt)

      // for each file found remove corresponding prompt
      _.each(projectFilesArr, function (file, index) {
        // debug(file, index)
        switch (file) {
          case '.git':
            debug('.git found')
            prompts.splice(0, 1)
            break
          case '.package.json':
            debug('.package.json found')
            prompts.splice(1, 1)
            break
          case '.editorconfig':
            debug('.editorconfig found')
            prompts.splice(2, 1)
            break
          default:
            debug('not done yet', file)
        }
      })
      // debug('post filter', prompts)
      // debug('cmdOpt', cmdOpt)
      // if yolo (no check) option is on and noPropt option is false
      if (cmdOpt.yolo !== true && cmdOpt.noPrompts === false) {
        self.prompt(prompts, function (result) {
          // apply prompt results to the conf
          _.each(result, function (v, k) {
            cmdOpt.initList[k] = v
          })
          debug(cmdOpt.initList)
          // cmdOpt.isDry = (args.options.dry === true) ? true : false
          // _.each()
          // const areDepsOk = checkDeps()
          cb()
        })
      } else {
        // if noPropmt option is true
        if (cmdOpt.noPrompts === true) {
        }
        debug('no confirm')
        cb()
      }
    })
}

module.exports = Cmd
