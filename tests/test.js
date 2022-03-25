const fs = require('fs')
const chalk = require('chalk')
const assert = require('assert').strict
const path = require('path')

const tgz_modify = require('../index')

let tgz_in = path.resolve(__dirname, 'input/package.tgz')
let tgz_out = path.resolve(__dirname, 'output/package.tgz')
let test_count = 0

let intent = async (title, cb) => {
  test_count++
  try {
    await cb()
    console.log(chalk.green('pass'), chalk.yellow(title))
  } catch (e) {
    console.log(chalk.red('fail'), chalk.yellow(title))
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

intent('tgz_modify should simply copy the input file over the output file', async () => {
  const cb = (header, data) => {
    if (header.name == 'package/README.md') { return null }
    else { console.log('keeping', header.name) }
    return data
  }

  await tgz_modify(tgz_in, tgz_out, cb)
})

intent('triggers onEnd handler if specified', async () => {
  let pResult = 'foo', cbResult = 'bar'
  const onFinish = err => cbResult = err
  const cb = (header, data) => data

  try {
    pResult = await tgz_modify(tgz_in, tgz_out, cb, onFinish)
  } catch (e) {
    pResult = e
  }

  assert.equal(pResult, cbResult)
  assert.equal(pResult, void 0)
})

intent('captures callback errors', async () => {
  const err = new Error()
  let pResult, cbResult
  const onFinish = err => cbResult = err
  const cb = () => { throw err }

  try {
    pResult = await tgz_modify(tgz_in, tgz_out, cb, onFinish)
  } catch (e) {
    pResult = e
  }

  assert.equal(pResult, cbResult)
  assert.equal(pResult, err)
})

// intent('the output file should exist', () => {
//   return fs.existsSync(tgz_out)
// })
