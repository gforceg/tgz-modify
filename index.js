const zlib = require('zlib')
const path = require('path')
const fs = require('fs')
const tar = require('tar-stream')

module.exports = function (in_file, out_file, callback) {

  if (!in_file) { throw 'no input file specified' }
  if (!out_file) { throw 'no output file specified' }
  if (!callback) { throw 'no callback was specified' }

  let input = fs.createReadStream(in_file)

  const gunzip = zlib.createGunzip()
  const gzip = zlib.createGzip()
  const pack = tar.pack()
  const extract = tar.extract()
  input.pipe(gunzip) // unzip the tar
    .pipe(extract) // parse the tar
    .on('entry', (header, stream, next) => {
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
    .on('finish', () => {
      pack.finalize() // >> .tar
    })

  input.on('close', () => {
    input.close()
    let outstream = new fs.createWriteStream(out_file, {autoClose: true})
    pack.pipe(gzip) // >> .tgz
    .pipe(outstream) // >> outfile.tgz
  })
}

// sample usage: print each file in the package and change nothing (modify data to make changes, return null to omit a file in the new .tgz)
// modify('files/package.tgz', 'output/package.tgz', (header, data) => { console.log(header.name) ; return data })