'use strict'
const cmdName = 'zip'
const cmdMsg = 'zip dirs'
const debug = require('debug')('gorhCli:' + cmdName)
const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')
const archiver = require('archiver')
const archive = archiver('zip')
const async = require('async')
const chalk = require('chalk')
// const blue = chalk.cyan
const red = chalk.red
// const green = chalk.green
// const mag = chalk.magenta

const zipMod = require('../tools/zipMod')

const confMan = require('../confMan')
const getConf = confMan.getConf

function listDirs (dirsPath) {
  return fs.readdirSync(dirsPath).filter(function(file) {
    return fs.statSync(path.join(dirsPath, file)).isDirectory();
  });
}

function zipDir (dirName, tarPath, buildsPath, self, cb) {
  const output = fs.createWriteStream(path.join(tarPath, dirName + '.zip'))

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes')
    console.log('archiver has been finalized and the output file descriptor has closed.')
  })

  archive.on('error', function (err) {
    throw err
  })

  archive.pipe(output)
  const buildPath = path.join(buildsPath, dirName)
  debug('buildsPath', buildPath)
  archive.bulk([
    { expand: true, cwd: buildPath, src: ['**'] }
  ])

  archive.finalize()
  self.log('archive made:', dirName)
}

function zipDirs (args, cb) {
  // get the configuration file
  const self = this
  const conf = getConf()

  if (_.has(conf, 'buildsPath') !== true) {
    self.log(red('no build paths'))
    return cb()
  }

  const cliDir = process.cwd()
  const buildsPath = path.join(cliDir, conf.buildsPath)
  const archivesPath = path.join(cliDir, '/archives')
  const dirList = listDirs(buildsPath)
  if (dirList.length < 1) {
    self.log(red('no dir to zip in'), buildsPath)
    return cb()
  }

  _.each(dirList, function (dirName) {
    debug(dirName)
    zipDir(dirName, archivesPath, buildsPath, self)
  })

  fs.ensureDirSync(archivesPath)

  // debug('cliDir:', cliDir)
  // debug('dirs in buildsPath:', listDirs(buildsPath))
  // debug(conf)
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdName, cmdMsg)
    .alias('z')
    .action(zipDirs)
}
