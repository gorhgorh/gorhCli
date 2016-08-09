#!/usr/bin/env node
/*global pwd exec rm*/
// const path = require('path')
// const pathos = '/gorhgorh/baseNodeRepo/archive/master.zip'
'use strict'
require('shelljs/global')
const fs = require('fs-extra')
const path = require('path')
const makeMan = require('./tools/manifestMod')
const cson = require('cson')

var vorpal = require('vorpal')()

vorpal
  .delimiter('gorhCLI $')
  .show()
// caches the path of the dir where the cli have been inited
var cliDir = pwd().stdout

// get the base repo files via snv to avoid .git data
// TODO : put url in a config file
function getBase (dest) {
  if (!dest) dest = './.tmp'
  exec('svn export https://github.com/gorhgorh/baseNodeRepo/trunk ' + dest + ' --force ', { silent: true }, () => {
  })
}

// git and Npm init commands
// TODO : add a remote entry in the config file and set it here
function cliInit () {
  console.log('initialising the git repo')
  exec('git init')
  console.log('creating default package.json')
  exec('npm init --yes')
  exec('npm install -D standard') // optional ?
  var pkg = fs.readJsonSync('./package.json')
  pkg.scripts.test = 'standard'
  fs.writeJsonSync('./package.json', pkg)
}

// remove everything, no confirm, at your own risks
function clearDir () {
  rm('-rf', './.*')
  rm('-rf', './*')
}

// checks is a file exist
function checkFileExistsSync (filepath) {
  let flag = true
  try {
    fs.accessSync(filepath, fs.F_OK)
  } catch (e) {
    flag = false
  }
  return flag
}

function initConfirm (v, cb) {
  var self = v
  self.prompt({
    type: 'confirm',
    name: 'continue',
    default: true,
    message: 'dir is not empty, initilalise ?'
  }, function (result) {
    if (result.continue) {
      // skip the prompts if a width was supplied
      initProj(cb, self)
    } else {
      cb()
    }
  })
}

function initProj () {
  getBase('./')
  cliInit()
}

function noRc (e) {
  console.log('no .yesrc.cson found')
}

// CLI commands
vorpal
  .command('base', 'initialise a base project')
  .action(function (args, cb) {
    const self = this
    if (fs.readdirSync(cliDir).length > 0) {
      initConfirm(self, cb)
    } else {
      initProj(self, cb)
    }
  })

vorpal
  .command('cl', 'clean current dir')
  .action(function (args, cb) {
    var msg = 'this will clean current dir ' + pwd().stdout
    const self = this

    this.prompt({
      type: 'confirm',
      name: 'erase',
      default: false,
      message: msg
    }, function (result) {
      if (result.erase) {
        self.log('erasing')
        clearDir()
        cb()
      } else {
        cb()
      }
    })
  })

vorpal
  .command('man', 'make manifest')
  .action(function (args, cb) {
    const self = this
    var manP = path.join(cliDir, 'imsConfigs.json')
    if (checkFileExistsSync(manP) !== true) {
      self.log('missing imsConfigs.json, create one and rerun ')
      return cb()
    }
    self.log('found imsConfigs.json')
    var imsConfs = fs.readJsonSync(manP)
    var imsPath = path.join(cliDir, imsConfs.path)

    fs.ensureDirSync(imsPath)

    this.prompt({
      type: 'confirm',
      name: 'makeMan',
      default: false,
      message: 'write manifests ?'
    }, function (result) {
      if (result.makeMan) {
        self.log('writting manifests')
        makeMan(imsConfs, imsPath)
      } else {
        cb()
      }
    })
  })

vorpal
  .command('ls', 'test list ')
  .action(function (args, cb) {
    const self = this
    console.dir(args)
    self.log('yo')
    self.prompt({
      type: 'list',
      name: 'test',
      message: 'list of things',
      choices: ['1', 'deux', 'tres', 'quattro']
    }, function (result) {
      console.log(result)
      cb()
    })
  })

vorpal
  .command('i', 'test for a full init')
  .action(function (args, cb) {
    const self = this
    console.dir(args)
    self.log('yo')
    self.prompt({
      type: 'checkbox',
      name: 'radio',
      message: 'list of things',
      choices: ['1', 'deux', 'tres', 'quattro']
    }, function (result) {
      console.log(result)
      cb()
    })
  })

vorpal
  .command('rc', 'play with the idea of a config file')
  .action(function (args, cb) {
    const rcPath = path.join(cliDir, '/yesrc.cson')
    const self = this
    // chech if a yesrc.cson file exist
    try {
      fs.statSync(rcPath)
    } catch (e) {
      // no yesrc
      noRc(e)
      this.prompt({
        type: 'confirm',
        name: 'createRc',
        default: true,
        message: 'no .yesrc.cson file found, create one ?'
      }, function (result) {
        // create one
        if (result.createRc) {
          self.log('create yesrc.cson')
          fs.copy(path.join(__dirname, './templates/yesrc.cson'), rcPath, function (err) {
            if (err) return console.error(err)
            console.log('created yesrc.cson')
            cb()
          })
        } else {
          // back to menu
          cb()
        }
      })
      cb()
    }
    // yesrc exists
    const conf = cson.load(rcPath)
    console.dir(conf)
    cb()
  })
