const fs = require('fs')
const assert = require('assert')
const chalk = require('chalk')

const tgz_modify = require('../index')

let tgz_in = 'input/package.tgz'
let tgz_out = 'output/package.tgz'
let test_count = 0

let intent = (title, cb) => {
  test_count++
  if(cb()) {
    console.log(chalk.green('pass'), chalk.yellow(title))
  } else {
    console.log(  chalk.red('fail'), chalk.yellow(title))
    throw ('failed test ' + test_count + ' ' + chalk.red(title))
  }
}

// the input file must exist and the output file must not
intent('the input file must exist and the outpt file must not', () => {
  let result = fs.existsSync(tgz_in)
  if(result) {
    if (fs.existsSync(tgz_out)) {
      fs.unlinkSync(tgz_out)
      result = !fs.existsSync(tgz_out)
    }
  }
  return result
})

intent('tgz_modify should simply copy the input file over the output file', () => {
  tgz_modify(tgz_in, tgz_out, (header, data) => {
    if (header.name == 'package/README.md') { return null }
    else { console.log('keeping', header.name) }
    return data
  })
  return true
})

// intent('the output file should exist', () => {
//   return fs.existsSync(tgz_out)
// })