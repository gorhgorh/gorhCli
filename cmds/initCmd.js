'use strict'
// ✔, ✖
const cmdName = 'init'
const cmdNameDesc = cmdName // + ' [dirnames...]'
const cmdMsg = 'init project'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')
const path = require('path')
const _ = require('lodash')
// const fs = require('fs-extra')
const shelljs = require('shelljs')
const exec = shelljs.exec
const which = shelljs.which

// const archiver = require('archiver')
// const async = require('async')
const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
const green = chalk.green
const mag = chalk.magenta

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync
const checkDeps = utils.checkDeps
// const filterExistingDirs = utils.filterExistingDirs
// const makePromtChoices = utils.makePromtChoices
// const listDirs = utils.listDirs
// const symCourse = utils.symCourse

const confMan = require('../confMan')
const getConf = confMan.getConf

const requiredFiles = ['.git', 'package.json', '.editorconfig', '.gorhCli', 'adapt.json']

/**
 * check the provided path for files provided as the second arg (array, optional)
 *
 * @param {string} basePath path to search for file
 * @param {array} filesArr array of string, that are path to file from the root of the project
 * @returns {array} project files found
 */
function checkConfFiles (basePath, filesArr) {
  if (!filesArr) filesArr = requiredFiles
  debug(blue('cheking for project files in:', basePath))
  const projectFilesArr = []
  _.each(filesArr, function (file) {
    const filePath = path.join(basePath, '/', file)
    if (checkFileExistsSync(filePath) === true) {
      debug(green('✔'), blue(file, 'found'))
      projectFilesArr.push(file)
    } else {
      debug(red('✖'), blue(file, 'not found'))
    }
  })
  return projectFilesArr
}

function makeInitCliPrompts (inits) {
  const prompts = []
  _.each(inits, function (val, key) {
    prompts.push({name: key, checked: val})
  })
  return prompts
}

function initTasks (initTasks, self, opts) {
  debug('initTasks')
  debug(initTasks)

  _.each(initTasks, function (val) {
    switch (val) {
      case 'baseFileCopy':
        self.log(mag('copying base project files'))
        exec('svn export https://github.com/gorhgorh/baseNodeRepo/trunk ./ --force', { silent: true })
        break
      case 'gitInit':
        if (checkFileExistsSync(path.join(process.cwd()), '.git') !== true) {
          self.log(mag('initialising git repo'))
          exec('git init', { silent: true })
        } else {
          self.log('git repo already exists')
        }
        break
      case 'npmInit':
        self.log(mag('creating default package.json'))
        exec('npm init -y', { silent: true })
        break
      case 'rcInit':
        self.log('not yet implemented')
        break

      default:
        break
    }
  })
}

function confirmPrompt (taskArr, opts, self, cb) {
  const defaultPrompt = {
    type: 'confirm',
    name: 'confirmPrompt',
    message: 'is it a yes or a no ?',
    default: true
  }
  const mergedOptions = _.defaultsDeep(opts.promptOpts, defaultPrompt)
  debug(mergedOptions)

  return self.prompt(mergedOptions, function (result) {
    debug(result)
    if (result.initConfirm === true && _.has(opts.promptOpts, 'action')) {
      self.log(blue('action starting'))
      opts.promptOpts.action(taskArr, self)
      cb()
    } else {
      self.log(blue('action canceled'))
      cb()
    }
    cb()
  })
}

function cmdAction (args, cb) {
  // get the configuration file
  debug(blue('start init cmd'))
  const self = this
  const conf = getConf()
  const opts = args.options

  // debug(conf)

  const cliDir = process.cwd()
  // const buildsPath = path.join(cliDir, conf.buildsPath)
  // const coursePath = path.join(cliDir, conf.coursePath)

  // get the list of file found on the project root (package.json, .gorhrc, etc)
  const projectFilesArr = checkConfFiles(cliDir)
  if (projectFilesArr.length > 0) {
    debug(blue('project file found'))
    debug(projectFilesArr)
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

  // alter default conf depenfing on cmd options
  if (opts.noPrompts === true) cmdOpt.noPrompts = true
  if (opts.adapt === true) cmdOpt.initList.adapt = true
  if (opts.standard === true) cmdOpt.initList.standard = true

  // build prompt list depending on option and file present in the root dir
  let taskList = ['basePrompt', 'gitPrompt', 'npmPrompt'] // basePrompt first

  const promptsArrFilter = []
  const promptArr = []
  let reqCmds = []

  const prompts = makeInitCliPrompts(cmdOpt.initList)

  // debug('args')
  // debug(args)

  // debug('cmdOpt')
  // debug(cmdOpt)

  // if build all option
  if (opts.all === true) {
    debug('all')
  } else {
    // else if clear all builds
  }
  let prompttaskList = []
  debug(blue('prompts'))
  debug(prompts)
  self.prompt({
    type: 'checkbox',
    name: 'installOptions',
    message: 'select the options you want to install',
    choices: prompts
  }, function (result) {
    debug('results', result)
    taskList = result.installOptions

    _.each(result.installOptions, function (option) {
      switch (option) {
        case 'baseFileCopy':
          reqCmds.push('svn')
          break
        case 'gitInit':
          reqCmds.push('git')
          break
        case 'nmpInit':
          reqCmds.push('npm')
          reqCmds.push('node')
          break
        case 'rcInit':
          // reqCmds.push('git')
          break
        case 'adapt':
          debug('adapt')
          // exec('adapt', {shell: '/bin/zsh'})
          if (!which('adapt')) {
            debug('Sorry, this script requires adapt')
          } else {
            reqCmds.push('adapt')
          }
          break
        case 'standard':
          reqCmds.push('npm')
          reqCmds.push('node')
          break

        default:
          debug(red('nope', option))
          break
      }
    })
    reqCmds = _.uniq(reqCmds)
    const areDepsOk = checkDeps(reqCmds)
    const confirmInitPromptOpts = {
      promptOpts: {
        name: 'initConfirm',
        message: 'this will install selected options:' + taskList.join(', '),
        action: initTasks
      }
    }

    confirmPrompt(taskList, confirmInitPromptOpts, self, cb)
    // self.prompt()

  // return cb()
  })
// return cb()
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('i')
    .option('-a, --all', 'all option on, no prompt')
    // .option('-d, --adapt', 'initialise an adapt repo')
    .option('-s, --standard', 'install standard.js')
    .option('-n, --noPrompts', "use default options, don't show prompts")
    .action(cmdAction)
// .hidden()
}
