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
const checkFileExistsSync = utils.checkFileExistsSync

/**
 *
 *
 * @param {string} dirName name of the dir to zip
 * @param {string} tarPath path to write the archive to
 * @param {string} buildsPath path to dir containing the dir to zip
 * @param {obj} self vorpal obj
 * @param {function} cb func
 */

function zipDir (dirName, tarPath, buildsPath, self, cb) {
  debug('cwd:', process.cwd())
  debug('zipping:', dirName)
  dirName
    .replace(/\\/, '')
    .replace(/\//, '')
  const archive = archiver('zip')
  const archP = path.join(tarPath, dirName + '.zip')
  debug(dirName)
  const output = fs.createWriteStream(archP)

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
  if (cb) cb()
}

/**
 * zip directories
 *
 * @param {object} args from the cli
 * @param {function} cb vorpal cb
 * @returns {function} cb vorpal cb || true
 */

function zipDirs (args, cb) {
  // get the configuration file
  const self = this
  const opts = args.options
  debug(opts)
  if (_.has(opts, 'dir') === true) {
    const zPath = path.join(process.cwd(), opts.dir)
    if (checkFileExistsSync(zPath) !== true) {
      self.log('dir does not exists', zPath)
      return cb()
    }
    debug('io', checkFileExistsSync(zPath))
    zipDir(opts.dir, process.cwd(), process.cwd(), self)
    return true
  }

  const conf = getConf()
  if (_.has(conf, 'buildsPath') !== true) {
    self.log(red('no build paths'))
    return cb()
  }

  let cliDir = process.cwd()
  // TODO : investigate for reason of the bad cwd in make cmd
  if (cliDir === path.join(process.cwd(), '../', conf.coursePath)) {
    debug(red('make'))
    cliDir = path.join(process.cwd(), '../')
  }
  let buildsPath = path.join(cliDir, conf.buildsPath)

  if (checkFileExistsSync(buildsPath) === false) {
    self.log(red('build paths does not exists', buildsPath))
    let testPath = path.join(buildsPath, '../../', conf.buildsPath)
    debug('testPath', testPath, checkFileExistsSync(testPath))
    if (checkFileExistsSync(testPath) === true) {
      buildsPath = testPath
    } else {
      self.log(red('build paths does not exists', buildsPath))
      return cb()
    }
  }
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
    .option('-d, --dir <dir>', 'scorm dir to zip.')
    .action(zipDirs)
}
