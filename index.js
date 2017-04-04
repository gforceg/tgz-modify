const zlib = require('zlib')
const path = require('path')
const fs = require('fs')
const stream = require('stream')
const chalk = require('chalk')
const child_process = require('child_process')
const tar = require('tar-stream')
const pack = tar.pack()
const extract = tar.extract()

module.exports = function (in_file, out_file, callback) {

  if (!in_file) { throw 'no input file specified' }
  if (!out_file) { throw 'no output file specified' }

  const input = fs.createReadStream(in_file)

  const gunzip = zlib.createGunzip()
  const gzip = zlib.createGzip()

  input.pipe(gunzip) // unzip the tar
    .pipe(extract) // parse the tar
    .on('entry', (header, stream, next) => {
      let file = header.name
        let data_in = ''
        stream.on('data', (d) => data_in += new Buffer(d, 'utf8').toString())
        stream.on('end', () => {
          let data_out = callback(header, data_in)
          if (data_out) {
            stream.pipe(pack.entry(header, data_out, next))
          } next()
        })
      // }
    })
    .on('end', () => {
      console.log('EOF')
    })
    .on('finish', () => {
      pack.finalize() // >> .tar
    })

  input.on('close', () => {
    let outstream = new fs.createWriteStream(out_file)
    pack.pipe(gzip) // >> .tgz
      .pipe(outstream) // >> outfile.tgz
  })

}

// sample usage
// modify('files/package.tgz', 'output/package.tgz', (header, data) => {
//   switch(header.name) {
//     case 'package/package.json':
//       let obj = JSON.parse(data)
//       obj.name = 'some-other-project'
//       obj.author = 'Some Jerk'
//       data = JSON.stringify(obj, null, '\t')
//       break;
//     case 'package/README.md':
//       return null // returning null will skip the file.
//   }
//   return data
// })