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
 * zip the content of a directory
 *
 * @param {String} dirName name of the dir to zip
 * @param {string} tarPath path to write the archive to
 * @param {string} buildsPath path to dir containing the dir to zip
 * @param {Object} self vorpal obj
 * @param [string] name name of the zip file, optional
 * @param {function} cb func
 */
function zipDir (dirName, tarPath, buildsPath, self, name, zipOpt, cb) {
  const force = (zipOpt.force === true) ? true : ''
  if (!name) name = dirName
  debug('zipping:', name, force)
  const archive = archiver('zip')
  const zName = name + '.zip'
  const zPath = path.join(tarPath, zName)
  if (checkFileExistsSync(zPath) && !force === true) {
    debug('carammba file exists')
    self.log(blue('file already exists clear it or use the force'))
    if (cb) return cb()
    else return
  }

  const output = fs.createWriteStream(zPath)

  self.log(blue('starting archive:'), dirName)

  output.on('close', function () {
    self.log(green('archive'), zName, green('written, total bytes:'), archive.pointer())
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
  const conf = self.parent.iConf || getConf()
  const zipOpt = {
    force: false
  }

  if (_.has(opts, 'force') === true) {
    zipOpt.force = true
  }

  if (_.has(opts, 'dir') === true) {
    const zPath = path.join(conf.cliDir, opts.dir)
    if (checkFileExistsSync(zPath) !== true) {
      self.log('dir does not exists', zPath)
      return cb()
    }
    debug('io', checkFileExistsSync(zPath))
    let zipName = opts.dir.replace(/\/$/, '') // remove trailing slash

    if (/\//.test(zipName)) {
      const dirStr = opts.dir.split('/')
      zipName = dirStr[dirStr.length - 1]
      // const DirName
    }
    debug('dirStr', zipName)
    // const fileName =

    zipDir(opts.dir, conf.cliDir, conf.cliDir, self, zipName, zipOpt, cb)
    return true
  }

  if (_.has(conf.initConf, 'buildsPath') !== true) {
    self.log(red('no build paths'))
    return cb()
  }

  const bPath = conf.initConf.buildsPath

  let cliDir = process.cwd()
  // TODO : investigate for reason of the bad cwd in make cmd
  if (cliDir === path.join(process.cwd(), '../', conf.initConf.coursePath)) {
    debug(red('make'))
    cliDir = path.join(process.cwd(), '../')
  }
  let buildsPath = path.join(cliDir, bPath)

  if (checkFileExistsSync(buildsPath) === false) {
    self.log(red('build paths does not exists', buildsPath))
    let testPath = path.join(buildsPath, '../../', bPath)
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
    zipDir(dirName, archivesPath, buildsPath, self, dirName, zipOpt)
  })
}

module.exports = function (vorpal, options) {
  vorpal
    .command(cmdName, cmdMsg)
    .alias('z')
    .option('-d, --dir <dir>', 'scorm dir to zip.')
    .option('-f, --force', 'if the zip already exists, erase it')
    .action(zipDirs)
}
