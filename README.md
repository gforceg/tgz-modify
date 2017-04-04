# tgz-modify

modify .tgz file entries:

Open `./files/package.tgz`.
make some changes to `package/package.json` and remove `README.md` all together.
Then output to a new .tgz file: `./output/package.tgz`

```javascript 
const tgz_modify = require('tgz-modify')

tgz_modify('files/package.tgz', 'output/package.tgz', (header, data) => {
  switch(header.name) {
    case 'package/package.json':
      let obj = JSON.parse(data)
      obj.name = 'some-other-project'
      obj.author = 'Some Jerk'
      data = JSON.stringify(obj, null, '\t')
      break;
    case 'package/README.md':
      return null // returning null will skip the file.
  }
  return data
})
```

To overwrite the .tgz file, simply use the same filename for the output file: 

```javascript
tgz.modify('./input.tgz', './input.tgz', ...)
```
