# RawEdit
The ArrayBuffer Editor based DataView (for modern browser).

1. Easier to manage byteOrder and offsets.
2. Supports resizable array buffers (some browsers).

## Usage

```html
<script src="path/to/RawEdit.js"></script>
```

```javascript
const raw = new RawEdit(arraybuffer);
raw.isLittleEndian = true;

let byte1 = raw.readUint8();
console.log(raw.offset) // 1

let byte2 = raw.readUint16();
console.log(raw.offset) // 3
```

# about RawEdit class

``{Type}``
  "Uint8", "Int8",
  "Uint16", "Int16",
  "Uint32", "Int32", "Float32",
  "BigUint64", "BigInt64", "Float64"

## static properties

1. ``platformEndian``

## static methods

1. ``createBuffer(``beginingByte, resizeMaxByte``)``

## properties

private

1. ``_currentOffset``
2. ``_textEncodingLabel``

public

1. <set|get> ``isLittleEndian`` No need to specify endianness every time you call a method.
2. <set|get> ``offset`` Offset are automatically changed during read/write operations.
3. <set|get> ``textEncoding`` reset TextEncoder / TextDeoder 
4. <> decoder
5. <> encoder

## methods

1. get operations
2. set operations
3. read operations
4. write operations
5. get bytearray operation
6. check matched operations
7. read text operations
8. write text operations

### 1. get operations

``not change offset`` after operation

``get{Type}(``byteOffset=this.offset, littleEndian=this.isLittleEndian``)``

return: ``value`` at offset


### 2. set operations

``not change offset`` after operation.

``CAUTION`` : Argument specification order is different from DataView.

``set{Type}(``data, byteOffset=this.offset, littleEndian=this.isLittleEndian``)``

return: ``void``


### 3. read operations

chage offset after operation.

Read the data based on byteOert and advance offset.

``read{Type}(``quantity?``)``

return: ``value`` at offset, or ``TypedArray`` has values when set quantity.

### 4. write operations

chage offset after operation.

Write data based on byteOert and advance offset.

``write{Type}(``data``)``

return: void

### 5. get byte array Operation


``not change offset`` after operation

``getBytes (``length, offset = this.offset``)``
return : ``{Array}``

short hand of that:

```javascript
const offset = raw.offset;
const rslt = Array.from({length:byte}, (b,i) => {
    return raw.getUint8(offset + i);
});
```


### 6. match Operation

default is ``change offset`` after matched.
when checkOnly flag is true, ``not change offset`` after matched.

1. ``matchBytes(``ary, checkOnly=false``)``;
2. ``matchASCII(``"ascii", checkOnly=false``)``;
return ``{boolean}``

### 7. read text Operation

1. readText ()
2. readSJIS ()
3. readUTF8 ()
4. readUTF16 ()

### 8. write text Operation

1. writeSJIS ()
2. writeUTF8 ()
3. writeUTF16 ()

