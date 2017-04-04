const path = require('path')
const chalk = require('chalk')
const fs = require('fs')
const stream = require('stream')

doneReading = () => {
  writeFile('test.txt')
}

readFile = (txt_file) => {
  txt_file = path.join('files', txt_file)
  const r = fs.createReadStream(txt_file, { encoding: 'utf8' })

  r.on('readable', () => {
    console.log(chalk.green('r'), chalk.blue('read()'))
    console.log(r.read())
  })

  r.on('end', () => {
    console.log(chalk.green('r'), chalk.blue('end'))
    r.close()
    doneReading()
  })
}

writeFile = (txt_file) => {
  txt_file = 'son_of_' + txt_file
  txt_file = path.join('files', txt_file)

  if (!fs.existsSync(txt_file)) {
    fs.open(txt_file, 'a+', (err, fd) => {
      if (err) {
        throw err;
      } else {
        fs.close(fd)
      }
    })
  }
  const w = fs.createWriteStream(txt_file, { flags: 'r+', defaultEncoding: 'utf8', fd: null, mode: 0o666, autoClose: false })

  w.on('open', (fd) => {
    console.log(chalk.red('w'), chalk.blue('open'), 'fd', chalk.cyan(fd))
    w.write('writing a buffer\n')
    w.end()
    w.close()
    // console.dir(w)
  })

  w.on('start', (fd) => {
    console.log(chalk.red('w'), chalk.blue('start'), 'fd', chalk.cyan(fd))
    // w.end()
  })

  w.on('end', (fd) => {
    console.log(chalk.red('w'), chalk.blue('end'), 'fd', chalk.cyan(fd))
  })

  w.on('finish', (fd) => {
    console.log(chalk.red('w'), chalk.blue('finish'), 'fd', chalk.cyan(fd))
    // fs.close(fd)
  })

  w.on('close', (fd) => {
    console.log(chalk.red('w'), chalk.blue('close'), 'fd', chalk.cyan(fd))
  })
}

readFile('test.txt')