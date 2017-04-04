const zlib = require('zlib')
const path = require('path')
const fs = require('fs')
const stream = require('stream')
const chalk = require('chalk')
const child_process = require('child_process')
const tar = require('tar-stream')
const pack = tar.pack()
const extract = tar.extract()

let tgz_in_file = 'files/package.tgz'
let tgz_out_file = 'output/package.tgz'
const input = fs.createReadStream(tgz_in_file)


const gunzip = zlib.createGunzip()
const gzip = zlib.createGzip()

input.pipe(gunzip) // unzip the tar
.pipe(extract) // parse the tar
  .on('entry', (header, stream, next) => {
    let file = header.name
    if (file == 'package/package.json') { // read package/package.json
      let package_json_contents = '';

      stream.on('data', (d) => { // fill the string buffer
        package_json_contents += new Buffer(d, 'utf8').toString()
      })

      stream.on('end', () => { // inflate and modify the json
        let package_json_obj = JSON.parse(package_json_contents)
        package_json_obj.name = 'not-ts-clipboard-anymore'
        package_json_obj.devDependencies['omg'] ='1.0.0'
        let package_json_buffer = JSON.stringify(package_json_obj, null, '\t')
        
        stream.pipe(pack.entry(header, package_json_buffer, next))  //replace the existing package_json_buffer w/ the new one
        stream.end()
      })
    } else {
      let data = '' // if it isn't package/package.json, then just repipe the original data
      stream.on('data', (d) => data += new Buffer(d, 'utf8').toString())
      stream.on('end', () => { stream.pipe(pack.entry(header, data, next)) ; next() })
    }
  })
  .on('end', () => {
    console.log('EOF')
  })
  .on('finish', () => {
    pack.finalize() // >> .tar
  })

  input.on('close', () => {
    let outstream = new fs.createWriteStream(tgz_in_file)
    pack.pipe(gzip) // >> .tgz
    .pipe(outstream) // >> outfile.tgz
  })

