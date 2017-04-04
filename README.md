# tgz-modify

modify .tgz file entries:

create a new .tgz file w/ a modified package.json

```javascript 
const tgz_modify = require('tgz-modify')
tgz_modify.modify('./input.tgz', './output.tgz', (file_name, data) => {
  if (file_name == 'package/package.json') {
    let obj = JSON.parse(data)
    obj.name = "a totally different project name"
    return JSON.stringify(obj, null, '\t')
  })
})
```

to overwrite the .tgz file, simply use the same filename for the output file: 

```javascript
tgz.modify('./input.tgz', './input.tgz', ...)
```