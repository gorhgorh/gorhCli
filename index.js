#!/usr/bin/env node
'use strict'
/* global */
const debug = require('debug')('CLI')
const fs = require('fs-extra')
const path = require('path')
const makeMan = require('./tools/manifestMod')
const cson = require('cson')
const _ = require('lodash')

const chalk = require('chalk')
const red = chalk.red
const blue = chalk.cyan
const green = chalk.green
const mag = chalk.magenta

const vorpal = require('vorpal')()

const utils = require('./utils')
const checkFileExistsSync = utils.checkFileExistsSync
const clearDir = utils.clearDir

const sh = require('./shellCmds')
const exec = sh.exec
const gCliDir = sh.getCliPath // return current cliPath

const builder = require('./cmds/build')
const buildAction = builder.buildAction

// caches the path of the dir where the cli have been inited
const rcFile = '.gorhClirc'
const cliDir = gCliDir()
const rcPath = path.join(cliDir, '/', rcFile)

const confMan = require('./confMan')
const getConf = confMan.getConf
const compConf = confMan.compareConf


let conf = getConf
let confIsLoaded = false

vorpal
  .delimiter('gorhCLI $')
  .show()

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
    self.log(blue('.editorconfig, found you seem to have opinions already'))
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
  if (!checkFileExistsSync(rcPath)) {
    self.log(green('base script ran, you should run rc and configure your project now'))
  }

  if (cb) cb()
}

/**
 * create a configuration file with basic defaults
 *
 * @param {object} self commandInstance, vorpal object
 * @param {function} cb vorpal's cb
 * @param {string} file name of the rc file default to cson
 */
function createRc (self, cb, file) {
  if (!file) file = rcFile
  self.prompt({
    type: 'confirm',
    name: 'createRc',
    default: true,
    message: 'no ' + file + ' file found, create one ?'
  }, function (result) {
    // create one
    if (result.createRc) {
      self.log(mag('create yesrc.cson'))
      fs.copySync(path.join(__dirname, './templates/' + file), rcPath)
      self.log(green('created', file))
    }
    if (cb) cb()
    else return true
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

function loadConf (self, cb) {
  // return if conf is loaded
  if (confIsLoaded === true) return true
  conf = getConf()

  if (_.has(conf, 'courses') !== true) {
    self.log(red('error conf is not loaded'))
    cb()
  }

  const isRc = checkFileExistsSync(rcPath)

  if (isRc !== true) {
    self.log(blue('no', rcFile, 'found create one ?'))
    if (createRc(self) === true) {
      confIsLoaded = true
      self.log(green('conf loaded'))
      if (cb) cb()
      else return true
    }
    // cb()
  }
}

// CLI commands
vorpal
  .command('init', 'initialise a base project')
  .alias('i')
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
  .command('clear', 'clean current dir')
  .alias('c')
  .action(function (args, cb) {
    debug('clear called')
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
  .command('manifest', 'make manifest')
  .alias('m')
  .alias('man')
  .action(function (args, cb) {
    const self = this
    const isRc = checkFileExistsSync(rcPath)
    if (isRc !== true) {
      self.log(red('you need a', rcFile, 'file'))
      cb()
    } else {
      loadConf()
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
  .command('create rc', 'create the config file')
  .alias('rc')
  .alias('r')
  .action(function (args, cb) {
    const self = this
    // chech if a yesrc.cson file exist
    const isRc = checkFileExistsSync(rcPath)
    if (isRc !== true) {
      conf = getConf()
      this.prompt({
        type: 'confirm',
        name: 'createRc',
        default: true,
        message: 'no ' + rcFile + ' file found, create one ?'
      }, function (result) {
        // create one
        if (result.createRc) {
          self.log(mag('create', rcFile))
          fs.writeJson(rcPath, conf, function () {
            self.log(blue('conf written'))
            cb()
          })
        } else {
          self.log(blue('no conf written'))
          cb()
        }
      })
    } else {
      self.log(blue('there is already a', rcFile))
      cb()
    }
  })

// tests
vorpal
  .command('pbuild [courses...]', 'proto build courses')
  .alias('pb')
  .action(function (args, cb) {
    const self = this
    if (args['courses'] !== undefined && args.courses.length < 1) this.log(args.courses.join(' '));
    debug('args', args)
    if (checkRc() === true) {
      self.log(green('yooooo'))
      cb()
    }
  })
  // .hidden()

vorpal
  .command('build [courses...]', 'build courses')
  .alias('b')
  .action(buildAction)

vorpal
  .command('getConf', 'get the config with rc')
  .alias('g')
  .action(function (args, cb) {
    const self = this
    const rcLoaded = loadConf(self, cb)
    if (rcLoaded === true) {
      debug('yoo')
    }
    // cb()
  })
  // .hidden()

// vorpal
//   .command('build [courses...]', 'build courses')
//   .alias('b')
//   .action(function (args, cb) {
//     const self = this
//     if (args['courses'] !== undefined && args.courses.length < 1) this.log(args.courses.join(' '));
//     debug('args', args)
//     if (checkRc() === true) {
//       self.log(green('yooooo'))
//       cb()
//     }
//   })
  // .hidden()

vorpal
  .command('say [words...]')
  .action(function (args, cb) {
    this.log(args)
    this.log(args.words.join(' '))
    cb()
  })

vorpal
  .command('t', 'test command, loadRc, list dir, prompt dir')
  .action(function (args, cb) {
    const self = this
    conf = getConf()
    debug(conf.courses)
    if (_.has(conf, 'courses') !== true) {
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
  .alias('tttt')
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
