#!/usr/bin/env node
/*global pwd exec rm*/
// const path = require('path')
// const pathos = '/gorhgorh/baseNodeRepo/archive/master.zip'
'use strict'
require('shelljs/global')
const fs = require('fs-extra')
const path = require('path')
const makeMan = require('./tools/manifestMod')

var vorpal = require('vorpal')()

vorpal
  .delimiter('gorhCLI $')
  .show()

// get path of where the command is ran
function getPwd () {
  return pwd().stdout
}

// get the base repo files via snv to avoi .git data
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

function clearDir () {
  rm('-rf', './.*')
  rm('-rf', './*')
}

// CLI commands

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

// cjecks is a file exist
function checkFileExistsSync (filepath) {
  let flag = true
  try {
    fs.accessSync(filepath, fs.F_OK)
  } catch (e) {
    flag = false
  }
  return flag
}

function initProj () {
  getBase('./')
  cliInit()
}

vorpal
  .command('init', 'initialise a project')
  .action(function (args, cb) {
    const self = this
    if (fs.readdirSync(getPwd()).length > 0) {
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
      } else {
        cb()
      }
    })
  })

vorpal
  .command('man', 'make manifest')
  .action(function (args, cb) {
    const self = this
    var manP = path.join(getPwd(), 'imsConfigs.json')
    if (checkFileExistsSync(manP) !== true) {
      self.log('missing imsConfigs.json, create one and rerun ')
      return cb()
    }
    self.log('found imsConfigs.json')
    var imsConfs = fs.readJsonSync(manP)
    var imsPath = path.join(getPwd(), imsConfs.path)

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
  .command('rd', 'test radio ')
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

