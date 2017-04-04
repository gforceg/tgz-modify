let zlib = require('zlib')
let path = require('path')
let fs = require('fs')
let stream = require('stream')

let tgz = fs.readFileSync('./package.tgz')
console.dir(tgz)
let tar_stream = new stream.Stream()
tar_stream.pipe(tgz)
tar_stream.on('data', (data) => {
  console.dir(data)
})
