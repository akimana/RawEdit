/** RawEdit is a Streamer */
const RawEdit = (function() {

    const platformEndian = (function() {
        let buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true);
        return new Int16Array(buffer)[0] === 256 ? "LE": "BE";
    })();

    // utilities
    const LIMIT_BYTE_LENGTH = 0x40000000; // 1GB

    const SUPPOTED_TYPES = [
        Uint8Array, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, 
        Float32Array, BigInt64Array, BigUint64Array, Float64Array
    ];

    const fname = (pfx,Typed) => pfx + Typed.name.replace(/Array$/, "");
    const isUndef = (o) => o === undefined;

    const _get = function (Typed, offset, endian) {
        isUndef(offset) && (offset = this._currentOffset);
        isUndef(endian) && (endian = this.isLittleEndian);
        return this._superCall(fname("get",Typed), offset, endian );
    }

    const _read = function (Typed, length) {
        let size = Typed.BYTES_PER_ELEMENT;
        if ( length && isFinite(length) && length > 0 ) {
            size *= length;
        }
        if ( this.offset + size > this.byteLength ) {
            throw new RangeError("Out of range");
        }

        if ( !isUndef(length) ) {
            return Typed.from({length}, _ => _read.call(this, Typed) );
        }

        const data = _get.call(this, Typed, this.offset);
        if ( this.offset + size < this.byteLength ) {
            this.offset += size;
        }
        else if (this.offset + size == this.byteLength) {
            this.offset += size;
            if ( this.onRead ) this.onRead();
        }
        return data;
    }

    const _set = function (Typed, value, offset, endian) {
        isUndef(offset) && (offset = this._currentOffset);
        isUndef(endian) && (endian = this.isLittleEndian);
        this._superCall(fname("set",Typed), offset, value, endian );
    }

    const _write = function (Typed, data) {
        if ( isUndef(data) ) {
            throw new TypeError("required a argument");
        }
        const isByteArray = Boolean(data?.constructor.name.match(/Ayyar$/));
        const isElement = !isByteArray && isFinite(data);
        if ( !isByteArray && !isElement ) {
            throw new TypeError("required a argument")
        }
        let size = Typed.BYTES_PER_ELEMENT;
        if ( isByteArray ) size *= data.length;
        if ( this.offset + size >= this.byteLength && this.buffer?.resizable ) {
            const { maxByteLength } = this.buffer;
            const requiredLength = this.byteLength + size;
            if ( requiredLength <= maxByteLength && maxByteLength <= LIMIT_BYTE_LENGTH ) {
                this.buffer.resize(requiredLength);
            }
            else throw Error("limit reaced");
        }
        else {
            throw new RangeError("Out of Range");
        }
 
        if ( isByteArray ) {
            return data.forEach(entry => _write.call(this, Typed, entry) );
        }
        _set.call(this, Typed, data);
        this.offset += size;
    }

    // for text
    const _decode = function(length) {
        if ( this.textEncoding.match(/^utf/i) ) {
            return this.decoder.decode( this.readUint8(length) );
        }
        const isPrintable = (byte) => 0x20 <= byte && byte < 0xFF;
        const rslt = Array.from({length}, _ => this.readUint8() )
            .reduce( (acc, byte) => {
                const printable = isPrintable(byte);
                if ( acc.printable && printable ) {
                    acc.bytes.push(byte);
                }
                else {
                    acc.printable = false;    
                }
                return acc;
            }, {printable:true, bytes:[]});
        return this.decoder.decode(new Uint8Array(rslt.bytes));
    }

    const _encode = function(str, byteLength, paddings) {
        if ( !isUndef(byteLength) ) {
            let bytes = _encode.call(this, str);
            if ( isFinite(byteLength) ) {
                for ( ;bytes && bytes.length > byteLength; ) {
                    const strlen = str.length;
                    str = str.substring(0,strlen-1);
                    bytes = _encode.call(this, str);
                }
            }
            let padSize = 0;
            if ( paddings && paddings.length ) {
                for (let pad, i = bytes.length; i <= byteLength; ++padSize) {
                    pad = paddings[i] || pad;
                    bytes.push(pad);
                }
            }
            this.writeUint8(bytes);
            return { str, bytes, padSize };
        }
        return this.encoder.encode(str);
    }

    const API_METHODS = Object.entries({
        get  : (Typed) => function(byteOffset, littleEndian) {
            return _get.call(this, Typed, byteOffset, littleEndian)
        },
        set  : (Typed) => function(value, byteOffset, littleEndian) {
            return _set.call(this, Typed, value, byteOffset, littleEndian)
        },
        read : (Typed) => function(quantity) {
            return _read.call(this, Typed, quantity)
        },
        write: (Typed) => function(value) {
            return _write.call(this, Typed, value)
        }
    });



    class RawEdit extends DataView {

        static platformEndian = platformEndian;

        static createBuffer (bytes, maxBytes=0) {
            let maxByteLength = 0;
            if ( bytes < maxBytes && maxBytes <= 1073741824 ) { // 1GB: 0x4000 0000
                maxByteLength = maxBytes;
            }
            return new ArrayBuffer(bytes, { maxByteLength })
        }
        

        constructor (...args) {
            super(...args);
            this._currentOffset = this.byteOffset;
            this.isLittleEndian = false;
            // for text
            this._textEncodingLabel = null;
            this.decoder = null;
            this.encoder = null;
        }

        _superCall (methodName, ...args) {
            return super[methodName](...args);
        }

        get textEncoding () {
            return this._textEncodingLabel;
        }
        set textEncoding (v) {
            if ( this._textEncodingLabel !== v ) {
                this._textEncodingLabel = v; // エンコーダ /　デコーダ を準備する
                this.decoder = new TextDecoder(v);
                this.encoder = new TextEncoder(v);
            }
        }

        get offset () { return this._currentOffset; }
        set offset (v) {
            v = v % this.byteLength;
            this._currentOffset =  v < 0 ? this.byteLength + v: v;
        }

        getBytes (length, offset = this.offset) {
            length = length|0;
            return Array.from({length}, (_,i)=> super.getUint8(offset+i));
        }

        matchBytes ( ary, checkOnly=false ) {
            if ( ary && ary.length ) {
                const
                    preCheckOffset = this.offset,
                    matchedAll = [...ary].every( c => c == this.readUint8() )
                ;
                if ( !matchedAll || checkOnly ) {
                    this.offset = preCheckOffset;
                }
                return matchedAll;
            }
            return false;
        }
        matchASCII ( txt = "", checkOnly=false ) {
            if ( txt && txt.match(/^[\u0020-\u007E]+$/) ) {
                const bytes = txt.split("").map( c => c.charCodeAt(0) );
                return this.matchBytes( bytes, checkOnly );
            }
            return false;
        }

        readText (byteLength, length) {
            if ( !isUndef(length) ) {
                return Array.from({length}, _=> _decode.call(this, byteLength));
            }
            return _decode.call(this, byteLength);
        }
        readSJIS (byteLength, length) {
            this.textEncoding = "shift_jis"; // not work in nodejs
            return this.readText(byteLength, length);
        }
        readUTF8 (byteLength, length) {
            this.textEncoding = "utf8";
            return this.readText(byteLength, length);
        }
        readUTF16 (byteLength, length) {
            this.textEncoding = "utf16" + (this.isLittleEndian ? "le": "be");
            return this.readText(byteLength, length);
        }

        writeSJIS (text, limit, paddings) {
            this.textEncoding = "shift_jis"; // not work in nodejs
            return _encode.call(this, text, limit, paddings);
        }
        writeUTF8 (text, limit, paddings) {
            this.textEncoding = "utf8";
            return _encode.call(this, text, limit, paddings);
        }
        writeUTF16 (text, limit, paddings) {
            this.textEncoding = "utf16" + (this.isLittleEndian ? "le": "be");
            return _encode.call(this, text, limit, paddings);
        }

    }

    SUPPOTED_TYPES.forEach( Typed => {
        const type = fname("",Typed);
        API_METHODS.forEach( ([operation, method]) => {
            Object.defineProperty(
                RawEdit.prototype,
                `${operation}${type}`,
                { value: method.call(this,Typed), enumerable:true }
            )
        });
    });

    return RawEdit;

})();
