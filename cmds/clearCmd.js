'use strict'
const cmdName = 'clear'
const cmdNameDesc = cmdName + ' [dirnames...]'
const cmdMsg = 'clear directories'
const debug = require('debug')('gorhCli:' + cmdName + 'Cmd')
const path = require('path')
const _ = require('lodash')
const fs = require('fs-extra')
// const archiver = require('archiver')
// const async = require('async')
const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
const green = chalk.green
// const mag = chalk.magenta

const utils = require('../utils')
const filterExistingDirs = utils.filterExistingDirs
const makePromtChoices = utils.makePromtChoices

const confMan = require('../confMan')
const getConf = confMan.getConf

function clearDirs (dirsArr) {
  _.each(dirsArr, function (pth) {
    debug('clearing', pth)
    fs.removeSync(pth)
  })
}

function cmdAction (args, cb) {
  // get the configuration file
  const self = this
  const conf = getConf()
  let dirPathArr = []
  const opts = args.options

  const cliDir = process.cwd()
  const buildsPath = path.join(cliDir, conf.buildsPath)
  // const coursePath = path.join(cliDir, conf.coursePath)

  // debug('conf', conf)
  debug('args', args)

  debug(blue('get the array of dirs to clear'))
  // if build all option
  if (opts.all === true) {
    debug('all')
    dirPathArr.push(cliDir)
  } else {
    // else if clear all builds
    if (opts.builds) {
      debug('builds')
      dirPathArr.push(buildsPath)
    } else {
      // else if some courses are specified from cli args
      if (opts.courses === true) {
        debug('courses')
        if (args.dirnames) {
          _.each(args.dirnames, function (val) {
            dirPathArr.push(path.join(buildsPath, val))
          })
        }
      }
    }
    // if clear adapt build option is true
    if (opts.build === true) {
      debug('adapt build')
      dirPathArr.push(path.join(cliDir, 'build'))
    }
  }

  // filter existing dirs
  const filteredDirs = filterExistingDirs(dirPathArr)
  if (filteredDirs.missingArr !== false) {
    self.log(blue('some dirs are missing:\n') + filteredDirs.missingArr.join('\n'))
  }
  dirPathArr = filteredDirs.existingArr

  if (dirPathArr === false) {
    self.log(red('no dir to clear with current args'))
    return cb()
  }

  debug(blue('dirnames'))
  debug(dirPathArr)

  // if list option
  if (opts.list) {
    const promtData = makePromtChoices(dirPathArr)
    debug('promtData')
    debug(promtData)
    self.prompt({
      type: 'checkbox',
      name: 'dirList',
      message: 'select the dirs you want manifest for',
      choices: promtData.dirPA
    }, function (result) {
      const listPathArr = result.dirList
      const newPathArr = []

      debug(listPathArr)
      _.each(listPathArr, function (val) {
        newPathArr.push(promtData.dirPO[val])
      })

      debug(newPathArr)
      clearDirs(newPathArr)
      self.log(green('cleared dirs:') + newPathArr.join('\n'))

      return cb()
    })
  } else {
    clearDirs(dirPathArr)
    self.log(green('cleared dirs:') + dirPathArr.join('\n'))
    return cb()
  }
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdNameDesc, cmdMsg)
    .alias('c')
    .option('-b, --build', 'clear adapt\'s build dir')
    .option('-s, --builds', 'clear the buildpath from rc')
    .option('-c, --courses', 'clear specified dir in the srcPath from rc')
    .option('-l, --list', 'list of dirs')
    .option('-a, --all', 'clear cliDir')
    .action(cmdAction)
    .hidden()
}
