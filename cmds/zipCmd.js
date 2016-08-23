'use strict'
const cmdName = 'zip'
const cmdMsg = 'zip dirs'
const debug = require('debug')('gorhCli:' + cmdName)
const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')
const archiver = require('archiver')
const chalk = require('chalk')
const blue = chalk.cyan
const red = chalk.red
const green = chalk.green
// const mag = chalk.magenta

const confMan = require('../confMan')
const getConf = confMan.getConf
const utils = require('../utils')
const listDirs = utils.listDirs

function zipDir (dirName, tarPath, buildsPath, self, cb) {
  debug('zipping:', dirName)
  const archive = archiver('zip')
  const output = fs.createWriteStream(path.join(tarPath, dirName + '.zip'))

  self.log(blue('starting archive:'), dirName)

  output.on('close', function () {
    self.log(green('archive'), dirName, green('written, total bytes:'), archive.pointer())
  })

  archive.on('error', function (err) {
    throw err
  })

  archive.pipe(output)
  const buildPath = path.join(buildsPath, dirName)
  archive.bulk([
    { expand: true, cwd: buildPath, src: ['**'] }
  ])

  archive.finalize()
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

  fs.ensureDirSync(archivesPath)

  _.each(dirList, function (dirName) {
    zipDir(dirName, archivesPath, buildsPath, self)
  })
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdName, cmdMsg)
    .alias('z')
    .action(zipDirs)
}
