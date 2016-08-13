#!/usr/bin/env node
'use strict'
/* global */
const debug = require('debug')('CLI')
const fs = require('fs-extra')
const path = require('path')
const makeMan = require('./tools/manifestMod')
const cson = require('cson')

const chalk = require('chalk')
const red = chalk.red
const blue = chalk.cyan
const green = chalk.green
const mag = chalk.magenta

const vorpal = require('vorpal')()

const utils = require('./utils')
const checkFileExistsSync = utils.checkFileExistsSync

const sh = require('./shellCmds')
const exec = sh.exec
const gCliDir = sh.getCliPath // return current cliPath

// caches the path of the dir where the cli have been inited
const cliDir = gCliDir()
const rcPath = path.join(cliDir, '/yesrc.cson')

let conf
let confIsLoaded = false

vorpal
  .delimiter('gorhCLI $')
  .show()

/**
 *
 * remove everything, no confirm, at your own risks
 *
 * @param {string} dir path to erase
 * @returns {bool} true if sucessfull
 */
function clearDir (dir) {
  fs.emptyDirSync(dir)
  return true
}

/**
 * prompt for confirmation if for the 'base' command
 *
 * @param {object} self commandInstance, vorpal object
 * @param {function} cb vorpal's cb
 */
function initConfirm (self, cb) {
  self.prompt({
    type: 'confirm',
    name: 'continue',
    default: true,
    message: 'dir is not empty, initilalise ?'
  }, function (result) {
    if (result.continue) {
      // skip the prompts if a width was supplied
      pInit(self, cb)
    // cb()
    }
  })
}

/**
 * initialise the repo with git package.json and some defaults
 *
 * @param {object} self commandInstance, vorpal object
 * @param {function} cb vorpal's cb
 */

function pInit (self, cb) {
  const gitP = path.join(cliDir, '/.git')
  const npmP = path.join(cliDir, '/package.json')
  const editP = path.join(cliDir, '/.editorconfig')

  if (checkFileExistsSync(editP)) {
    self.log(blue('.editorconfig found you seem to have opinions already'))
  } else {
    self.log(mag('copying base files'))
    exec('svn export https://github.com/gorhgorh/baseNodeRepo/trunk ./ --force', { silent: true }, function () {
      self.log(green('base files cloned'))
    })
  }

  if (checkFileExistsSync(gitP)) {
    self.log(blue('already a git repo'))
  } else {
    self.log(mag('initialising the git repo'))
    exec('git init', { silent: true })
  }
  if (checkFileExistsSync(npmP)) {
    self.log(blue('package.json found'))
  } else {
    self.log(mag('creating default package.json'))
    exec('npm init --yes', { silent: true })

    self.log(mag('installing standard js'))
    exec('npm install -D standard', { silent: true }) // optional ?
    self.log(mag('editing package.json'))
    const pkg = fs.readJsonSync('./package.json')
    pkg.scripts.test = 'standard'
    fs.writeJsonSync('./package.json', pkg)
    self.log(green('done npm init'))
  }
  if (checkFileExistsSync(rcPath)) {
    self.log(green('base script ran, you should run rc and configure your project now'))
  }

  if (cb) cb()
}

/**
 *
 *
 * @param {object} self commandInstance, vorpal object
 * @param {function} cb vorpal's cb
 */
function createRc (self, cb) {
  self.prompt({
    type: 'confirm',
    name: 'createRc',
    default: true,
    message: 'no yesrc.cson file found, create one ?'
  }, function (result) {
    // create one
    if (result.createRc) {
      self.log(mag('create yesrc.cson'))
      fs.copySync(path.join(__dirname, './templates/yesrc.cson'), rcPath)
      self.log(green('created yesrc.cson'))
    }
    cb()
  })
}

/**
 * check if there is already a config file at the path of the cli
 *
 * TODO : check current path against cli path, and look up from there to cli path
 * and change dir if needed
 *
 * @returns {bool} true if there is a rc file
 */
function checkRc (pth) {
  if (!pth) pth = rcPath
  const isRc = checkFileExistsSync(pth)
  if (isRc !== true) {
    debug(red('no rc', pth))
    return false
  } else {
    return true
  }
}

/**
 *
 *
 * @param {any} self
 * @param {any} prompOpt
 * @param {any} action
 * @param {any} cb
 */
// function getInputCourseList (self, prompOpt, action, cb) {
// }

/**
 * loads the config file
 *
 * @param {any} self
 * @param {any} cb
 * @returns
 */

function loadRc (self, cb) {
  // return if conf is loaded
  if (confIsLoaded === true) return true

  const isRc = checkFileExistsSync(rcPath)
  if (isRc !== true) {
    self.log(blue('no yesrc.cson found'))
    createRc(self, cb)
    cb()
  } else {
    conf = cson.load(rcPath)
    confIsLoaded = true
    self.log(green('conf loaded'))
    return true
  }
}

// CLI commands
vorpal
  .command('base', 'initialise a base project')
  .alias('b')
  .action(function (args, cb) {
    const self = this
    // if there are files in the dir confirm action
    if (fs.readdirSync(cliDir).length > 0) {
      initConfirm(self, cb)
    } else {
      pInit(self, cb)
    }
  })

vorpal
  .command('clearDir', 'clean current dir')
  .alias('c')
  .action(function (args, cb) {
    debug('clearDir called')
    const self = this
    var msg = 'this will clean current dir ' + cliDir

    this.prompt({
      type: 'confirm',
      name: 'erase',
      default: false,
      message: msg
    }, function (result) {
      if (result.erase) {
        self.log(mag('erasing'))
        clearDir(cliDir)
        self.log(green('cleared'))
        cb()
      } else {
        cb()
      }
    })
  })

vorpal
  .command('man', 'make manifest')
  .alias('m')
  .action(function (args, cb) {
    const self = this
    const isRc = checkFileExistsSync(rcPath)
    if (isRc !== true) {
      self.log(red('you need a yesrc.cson file'))
      cb()
    } else {
      const conf = cson.load(rcPath)
      var imsPath = path.join(cliDir, conf.buildsPath)

      this.prompt({
        type: 'confirm',
        name: 'makeMan',
        default: true,
        message: 'write manifests ?'
      }, function (result) {
        if (result.makeMan) {
          self.log(mag('writting manifests'))
          fs.ensureDirSync(imsPath)
          makeMan(conf, imsPath, self)
          cb()
        } else {
          cb()
        }
      })
    }
  })

vorpal
  .command('rc', 'create the config file')
  .action(function (args, cb) {
    const self = this
    // chech if a yesrc.cson file exist

    const isRc = checkFileExistsSync(rcPath)
    if (isRc !== true) {
      this.prompt({
        type: 'confirm',
        name: 'createRc',
        default: true,
        message: 'no yesrc.cson file found, create one ?'
      }, function (result) {
        // create one
        if (result.createRc) {
          self.log(mag('create yesrc.cson'))
          fs.copy(path.join(__dirname, './templates/yesrc.cson'), rcPath, function (err) {
            if (err) return console.error(err)
            console.log(green('created yesrc.cson'))
            cb()
          })
        } else {
          // back to menu
          cb()
        }
      })
    } else {
      // yesrc exists
      const conf = cson.load(rcPath)
      console.dir(conf)
      cb()
    }
  })

// tests
vorpal
  .command('t', 'test command, loadRc, list dir, prompt dir')
  .action(function (args, cb) {
    const self = this
    let rcLoaded = loadRc(self, cb)
    if (rcLoaded !== true) {
      self.log(red('error conf is not loaded'))
      cb()
    } else {
      const dirsList = []
      conf.courses.forEach(function (o, i) {
        dirsList.push(o.name)
      })
      console.log(dirsList)
      self.prompt({
        type: 'checkbox',
        name: 'courseList',
        message: 'list of things',
        choices: dirsList
      }, function (result) {
        if (result.courseList.length < 1) {
          self.log(red('one, choice, you need to make (at least) ONE choice'))
          return cb()
        }
        self.log(result.courseList)
        cb()
      })
    }
  })
  // .hidden()

vorpal
  .command('tt', 'test command, use at your own risks (may erase hdd)')
  .action(function (args, cb) {
    const self = this
    if (checkRc() === true) {
      self.log(green('yooooo'))
      cb()
    }
  })
  .hidden()

vorpal
  .command('ttt', 'test command, use at your own risks (may erase hdd)')
  .action(function (args, cb) {
    const self = this
    pInit(self, cb)
  })
  .hidden()

vorpal
  .command('ls', 'test list ')
  .action(function (args, cb) {
    const self = this

    self.prompt({
      type: 'list',
      name: 'test',
      message: 'list of things',
      choices: ['1', 'deux', 'tres', 'quattro']
    }, function (result) {
      self.log(result)
      cb()
    })
  })
  .hidden()

vorpal
  .command('i', 'test for a full init')
  .action(function (args, cb) {
    const self = this
    self.prompt({
      type: 'checkbox',
      name: 'radio',
      message: 'list of things',
      choices: ['1', 'deux', 'tres', 'quattro']
    }, function (result) {
      self.log(result)
      cb()
    })
  })
  .hidden()
