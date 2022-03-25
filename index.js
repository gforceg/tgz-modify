const zlib = require('zlib')
const path = require('path')
const fs = require('fs')
const tar = require('tar-stream')

module.exports = async function (in_file, out_file, callback, onFinish = () => {}) {

  if (!in_file) { throw 'no input file specified' }
  if (!out_file) { throw 'no output file specified' }
  if (!callback) { throw 'no callback was specified' }

  let input = fs.createReadStream(in_file)

  let res, rej
  const p = new Promise((...args) => [res, rej] = args)
  const result = (err) => {
    err ? rej (err) : res()
    onFinish(err)
  }

  const gunzip = zlib.createGunzip()
  const gzip = zlib.createGzip()
  const pack = tar.pack()
  const extract = tar.extract()
  input.pipe(gunzip) // unzip the tar
    .pipe(extract) // parse the tar
    .on('entry', (header, stream, next) => {
      let data_in = ''
      stream.on('error', result)
      stream.on('data', (d) => data_in += new Buffer(d, 'utf8').toString())
      stream.on('end', () => {
        let data_out
        try {
          data_out = callback(header, data_in)
        } catch (err) {
          stream.emit('error', err)
        }

        if (data_out) {
          stream.pipe(pack.entry(header, data_out, next))
        } next()
      })
    })
    .on('error', result)
    .on('finish', () => {
      pack.finalize() // >> .tar
    })

  input.on('close', () => {
    input.close()
    let outstream = new fs.createWriteStream(out_file, {autoClose: true})

    // https://github.com/nodejs/node/issues/15262
    .on('error', result)
    .on('finish', result)

    pack.pipe(gzip) // >> .tgz
    .pipe(outstream) // >> outfile.tgz
  })

  return p
}

// sample usage: print each file in the package and change nothing (modify data to make changes, return null to omit a file in the new .tgz)
// modify('files/package.tgz', 'output/package.tgz', (header, data) => { console.log(header.name) ; return data })
