#!/usr/bin/env node
/*global pwd exec rm*/
// const path = require('path')
// const pathos = '/gorhgorh/baseNodeRepo/archive/master.zip'
const fs = require('fs-extra')
require('shelljs/global')

var vorpal = require('vorpal')()

function getPwd () {
  return pwd().stdout
}

function getBase (dest, cb, action) {
  if (!dest) dest = './.tmp'
  exec('svn export https://github.com/gorhgorh/baseNodeRepo/trunk ' + dest + ' --force ', { silent: true }, (code, stdout, stderr) => {
    action.log('clonned base proj')
    cb()
  })
}

function cliInit () {
  console.log('initialising the git repo')
  exec('git init')
  console.log('creating default package.json')
  exec('npm init --yes')
}

// var duckCount = 0
// var wabbitCount = 0

// duck
// vorpal
//   .command('duck', 'Outputs "rabbit"')
//   .action(function (args, callback) {
//     this.log('Wabbit')
//     callback()
//   })
// vorpal
//   .command('duck season', 'Outputs "rabbit season"')
//   .action(function (args, callback) {
//     duckCount++
//     this.log('Wabbit season')
//     callback()
//   })

// // wabbit
// vorpal
//   .command('wabbit', 'Outputs "duck"')
//   .action(function (args, callback) {
//     this.log('Duck')
//     callback()
//   })
// vorpal
//   .command('wabbit season', 'Outputs "duck season"')
//   .action(function (args, callback) {
//     // no cheating
//     if (duckCount < 2) {
//       duckCount = 0
//       this.log("You're despicable")
//       callback()
//     } else if (wabbitCount === 0) {
//       wabbitCount++
//       this.log('Duck season')
//       callback()
//     } else {
//       this.log("I say it's duck season. And I say fire!")
//       vorpal.ui.cancel()
//     }
//   })

// vorpal
//   .delimiter('daffy$')
//   .show()

// check if a dir is empty
function isEmpty (cb) {
  var items = [] // files, directories, symlinks, etc
  var isE
  fs.walk(getPwd())
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('end', function () {
      if (items.length > 1) isE = false
      else isE = true
      // console.dir(items) // => [ ... array of files]
      cb(isE)
    })
}

function initDir () {
  isEmpty(function (isE) { console.log(isE, 'isE') })
}

// CLI commands

function initConfirm (v, cb) {
  console.log('yuppi init confirms')
  var self = v
  self.prompt({
    type: 'confirm',
    name: 'continue',
    default: false,
    message: 'dir is not empty, initilalise ?'
  }, function (result) {
    if (result.continue) {
      // skip the prompts if a width was supplied
      self.log('continue')
      initProj(cb, self)
    } else {
      cb()
    }
  })
}

function cleanup () {

}


function initProj (self, cb) {
  self.log('getting base files')
  getBase('./', cb, self)
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
        // skip the prompts if a width was supplied
        self.log('erasing')
        rm('-rf', './.*')
        rm('-rf', './*')
      } else {
        cb()
      }
    })
  })

// console.log(getPwd())
// getBase()

vorpal
  .delimiter('gorhCLI $')
  .show()

// initDir()


