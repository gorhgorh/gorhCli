'use strict'
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
const sed = shelljs.sed

const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
const green = chalk.green
const mag = chalk.magenta

const utils = require('../utils')
const checkFileExistsSync = utils.checkFileExistsSync
const checkDeps = utils.checkDeps

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

/**
 * create an array of the provided inits obj
 *
 * @param {obj} inits object resulting from the prompt (result)
 * @returns {array}
 */
function makeInitCliPrompts (inits) {
  const prompts = []
  _.each(inits, function (val, key) {
    prompts.push({name: key, checked: val})
  })
  return prompts
}

function initTasks (initTasksArr, self, cb) {
  debug('initTasksArr')
  debug(initTasksArr)
  let gitC = false
  _.each(initTasksArr, function (task) {
    switch (task) {
      case 'baseFileCopy':
        self.log(mag('copying base project files'))
        exec('svn export https://github.com/gorhgorh/baseNodeRepo/trunk ./ --force')
        break
      case 'gitInit':
        debug(red('----------'))
        debug(red('----------'))
        debug(process.cwd(), checkFileExistsSync(path.join(process.cwd()), '.git'))
        debug(red('----------'))
        debug(red('----------'))
        if (checkFileExistsSync(path.join(process.cwd()), '.git') !== true) {
          gitC = true
          self.log(mag('initialising git repo'))
          exec('git init')
        } else {
          self.log('git repo already exists')
        }
        break
      case 'npmInit':
        self.log(mag('creating default package.json'))
        exec('npm init -y')
        break
      // case 'rcInit':
      //   self.log('not yet implemented')
      //   break
      case 'adapt':
        self.log(mag('installing adapt'))
        exec('adapt create baseAdapt')
        break
      case 'standard':
        self.log(mag('installing standard'))
        exec('npm install -D standard')
        sed('-i', 'echo.*1', 'standard', 'package.json')

        break
      case 'nodeToolBelt':
        self.log(mag('installing standard'))
        exec('npm install -S lodash fs-extra debug')
        break

      default:
        break
    }
  })

  if (gitC === true) {
    self.log(mag('initCommit'))
    exec('git add . && git commit -m "init commit"')
  }

  if (cb) cb()
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
    // cb()
    } else {
      self.log(blue('action canceled'))
      cb()
    }
  // cb()
  })
}

function cmdAction (args, cb) {
  // get the configuration file
  debug(blue('start init cmd'))
  const self = this
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
    force: false,
    initList: {
      baseFileCopy: false,
      gitInit: true,
      npmInit: false,
      // rcInit: true,
      // adapt: false,
      nodeToolBelt: false,
      standard: false
    }
  }

  // alter default conf depenfing on cmd options
  if (opts.force === true) {
    cmdOpt.force = true
    cmdOpt.npmInit = true
    cmdOpt.nodeToolBelt = true
    cmdOpt.standard = true
  }
  if (opts.adapt === true) cmdOpt.initList.adapt = true
  if (opts.nodeToolBelt === true) cmdOpt.initList.nodeToolBelt = true
  if (opts.standard === true) {
    cmdOpt.initList.npmInit = true
    cmdOpt.initList.standard = true
  }

  // build prompt list depending on option and file present in the root dir
  let taskList = ['baseFileCopy', 'gitInit', 'npmInit', 'standard'] // basePrompt first
  if (opts.force === true) {
    initTasks(taskList, self)
  } else {
    let reqCmds = []

    const prompts = makeInitCliPrompts(cmdOpt.initList)

    // if build all option
    if (opts.all === true) {
      debug('all')
    } else {
      // else if clear all builds
    }
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

      _.each(taskList, function (option) {
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
              debug(blue('Adapt test pushed'))
              reqCmds.push('adapt')
            }
            break

          default:
            debug(red('node', option))
            reqCmds.push('npm')
            reqCmds.push('node')
            break
        }
      })

      reqCmds = _.uniq(reqCmds)
      const areDepsOk = checkDeps(reqCmds)
      debug('are deps ok ?:', areDepsOk)

      const confirmInitPromptOpts = {
        promptOpts: {
          name: 'initConfirm',
          message: 'this will install selected options:' + taskList.join(', '),
          action: initTasks
        }
      }
      confirmPrompt(taskList, confirmInitPromptOpts, self, cb)
    })
  }
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('i')
    // .option('-d, --adapt', 'initialise an adapt repo')
    .option('-f, --force', "use default options, don't show prompts")
    .option('-s, --standard', 'install standard.js')
    .option('-n, --nodeToolBelt', 'install nodeToolBelt (lodash, fs-extra, debug)')
    .action(cmdAction)
// .hidden()
}
