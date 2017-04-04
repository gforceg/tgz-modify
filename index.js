const zlib = require('zlib')
const path = require('path')
const fs = require('fs')
const stream = require('stream')
const chalk = require('chalk')
const child_process = require('child_process')
const tar = require('tar-stream')
const pack = tar.pack()
const extract = tar.extract()
// let tgz_file = path.join('files', 'package.tgz')
// let tar_file = path.join('files', 'package.tar')

let tgz_file = 'files/package.tgz'
let tar_file = 'files/package.tar'
const input = fs.createReadStream(tgz_file)
const new_tgz = fs.createWriteStream('files/package_new.tar')
// const output = fs.createWriteStream(tar_file)

const gunzip = zlib.createGunzip()
const gzip = zlib.createGzip()

input.pipe(gunzip) // unzip the tar
.pipe(extract) // parse the tar
  .on('entry', (header, stream, next) => {
    let file = header.name
    // read package/package.json
    if (file == 'package/package.json') {
      console.log(chalk.yellow('found package/package.json'))
      let package_json_contents = '';
      // fill the string buffer
      stream.on('data', (d) => {
        package_json_contents += new Buffer(d, 'utf8').toString()
      })
      // inflate and modify the json
      stream.on('end', () => {
        let package_json_obj = JSON.parse(package_json_contents)
        package_json_obj.name = 'not-ts-clipboard-anymore'
        package_json_obj.devDependencies['omg'] ='1.0.0'
        new fs.createWriteStream('files/test.json').write(JSON.stringify(package_json_obj, null, '\t'))
        // stream.pipe(pack.entry(header, JSON.stringify(package_json_obj, null, '\t', next)))
        // .pipe(gzip)
        // .pipe(new_tgz)
        // .pipe(gzip)
        // .pipe(new StreamWriter('files/package2.tgz'))
        stream.end()
        // next()
        // e.pipe(tar.Pack({ name: 'package/package.json'}, JSON.stringify(package_json_obj)))
        // e.pipe(new fs.createWriteStream('files/test.json'))
        // .pipe(gzip)
      })
    } else {
      stream.on('end', () => next())
    }
  })
  .on('end', () => {
    console.log('EOF')
  })
// })