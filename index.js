const zlib = require('zlib')
const path = require('path')
const fs = require('fs')
const stream = require('stream')
const chalk = require('chalk')

// let tgz = fs.readFileSync('./package.tgz')
// console.dir(tgz)
// let tar_stream = new stream.Stream()
// tar_stream.pipe(tgz)

// tar_stream.on('data', (data) => {
  // console.dir(data)
// })


const r = fs.createReadStream('test.txt', {encoding: 'utf8'})

r.on('readable', () => {
  console.log(chalk.blue('readable'))
  console.log(r.read())
})

r.on('end', () => {
  console.log(chalk.blue('end'))
  r.close()
})

const w = fs.createWriteStream('test.txt', {flags: 'r+', defaultEncoding: 'utf8', fd: null, mode: 0o666, autoClose: true})

w.on('open', () => {
})
