# RawEdit
The ArrayBuffer Editor based DataView (for modern browser).

1. Easier to manage byteOrder and offsets.
2. Supports resizable array buffers (some browsers).

|{operation}\{Type}|Uint8|Int8|Uint16|Int16|Uint32|Int32|Float32|BigUint64|BigInt64|Float64|
|get|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|
|set|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|✓(1)|
|read|✓(2)|✓(2)|✓(2)|✓(2)|✓(2)|✓(2)|✓(2)|✓(2)|✓(2)|✓(2)|
|write|✓(3)|✓(3)|✓(3)|✓(3)|✓(3)|✓(3)|✓(3)|✓(3)|✓(3)|✓(3)|

✓(1) not change offset
✓(2) chage offset automatically.
✓(3) chage offset and resize automatically.

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

## static properties

1. ``platformEndian``

## static methods

1. ``createBuffer(beginingByte, resizeMaxByte)``

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

``get{Type}(byteOffset=this.offset, littleEndian=this.isLittleEndian)``
return: value in TypedRange

|method\return||
|getUint8|number|
|getInt8|number|
|getUint16|number|
|getInt16|number|
|getUint32|number|
|getInt32|number|
|getFloat32|number|
|getBigUint64|number|
|getBigInt64|number|
|getFloat64|number|

### 2. set operations

``not change offset`` after operation.
``CAUTION`` : Argument specification order is different from DataView.

``setType(data, byteOffset=this.offset, littleEndian=this.isLittleEndian)``
return: void

|method\return|void|
|setUint8||
|setInt8||
|setUint16||
|setInt16||
|setUint32||
|setInt32||
|setFloat32||
|setBigUint64||
|setBigInt64||
|setFloat64||

### 3. read operations

chage offset after operation.

isLittleEndian に基づいてデータを読み、オフセットを進めます。
``read{Type}(quantity?)``
return: value at offset, or TypedArray when set quantity.

|method\return|no quantity|quantity|
|readUint8|number|Uint8Array|
|readInt8|number|Int8Array|
|readUint16|number|Uint16Array|
|readInt16|number|Int16Array|
|readUint32|number|Uint32Array|
|readInt32|number|Int32Array|
|readFloat32|number|Float32Array|
|readBigUint64|number|BigUint64Array|
|readBigInt64|number|BigInt64Array|
|readFloat64|number|Float64Array|

### 4. write operations

chage offset after operation.

### 5. get byte array Operation

5-1. getBytes ( length, offset = this.offset )

``not change offset`` after operation

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

6-1. matchBytes(ary, checkOnly=false);
6-2. matchASCII("ascii", checkOnly=false);
return boolean

### 7. read text Operation

7-1. readText ()
7-2. readSJIS ()
7-3. readUTF8 ()
7-4. readUTF16 ()

### 8. write text Operation

8-2. writeSJIS ()
8-2. writeUTF8 ()
8-3. writeUTF16 ()

