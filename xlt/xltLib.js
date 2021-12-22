const Base58 = require("./Base58");
const sha256 = require("./c_sha256");
const ripemd160 = require("./ripemd160");
const BigInteger = require("./jsbn").BigInteger;
const RSAKey = require("./jsrsasign-rsa-min");
function generateFromEntropy(entropy, version, testSecret) {
  var bitLength = 512;
  var addressVersion = 2;
  switch (version) {
    case 4:
      bitLength = 1024;
      addressVersion = version;
      break;
    case 5:
      bitLength = 2048;
      addressVersion = version;
      break;
  }
  var rsa = generateRsaKeys(bitLength, "10001", entropy);
  var arr = rsa.n.toByteArray();
  arr.unshift(addressVersion);
  var pubkey_inner_hash = sha256.rstr_sha256(arrayToStr(arr)); // address
  var account_id = ripemd160.rstr_rmd160(pubkey_inner_hash);
  var payload =
    (addressVersion == 2 ? String.fromCharCode(0) : "") + account_id;
  var chksum_hash1 = sha256.rstr_sha256(payload);
  var chksum_hash2 = sha256.hex_sha256r(chksum_hash1);
  var dataToEncode = String.fromCharCode(version) + payload;
  for (var i = 0; i < 4; i++) {
    var str = chksum_hash2.substr(i * 2, 2);
    var code = parseInt(str, 16);
    dataToEncode += String.fromCharCode(code);
  }
  var address = Base58.encode(strToArray(dataToEncode));
  var secret = Base58.encode(
    strToArray(String.fromCharCode(version) + arrayToStr(entropy))
  );
  if (testSecret != null && secret != testSecret) {
    return null;
  } else {
    var obj = new Object();
    obj.version = version;
    obj.publicKey = rsa.n.toRadix(16);
    obj.privateKey = rsa.d.toRadix(16);
    obj.address = address;
    if (testSecret == null) {
      obj.secret = secret;
    }
    return obj;
  }
}
class hmac_drbg {
  constructor(entropyInput, personalizationString) {
    this._value = "";
    this._SECURITY_STRENGTH = 256;
    this._MAX_PERSONALIZATION_STRING_LENGTH_BYTES = 160 / 8;
    this._ENTROPY_INPUT_SIZE_BYTES = Math.floor(
      ((this._SECURITY_STRENGTH / 8) * 3) / 2
    );
    this._MAX_BYTES_TOTAL = 10000;
    this._DIGEST_NUM_BYTES = 256 / 8;
    this._MAX_BYTES_PER_REQUEST = 937;
    this._BYTE_ARRAY_0 = String.fromCharCode(0);
    this._BYTE_ARRAY_1 = String.fromCharCode(1);
    var seedMaterial = entropyInput;
    if (personalizationString != null) {
      seedMaterial += personalizationString;
    }
    var tmp_array = "";
    for (var i = 0; i < 256 / 8; i++) tmp_array += String.fromCharCode(0);
    this.setKey(tmp_array);
    this._value = "";
    for (var i = 0; i < this._DIGEST_NUM_BYTES; i++)
      this._value += String.fromCharCode(1);
    this.hmacDrbgUpdate(seedMaterial);
    this._bytesGenerated = 0;
  }
  setKey(key) {
    this._hmac = key;
  }
  hash(x) {
    return sha256.hmac_sha256(this._hmac, x);
  }
  nextBytes(length) {
    var result = "";
    for (var i = 0; i < length; i++) {
      result += String.fromCharCode(0);
    }
    result = this.nextBytes1(result);
    return result;
  }
  nextBytes_to_buffer(length) {
    var result = "";
    result = this.nextBytes1(result, length);
    return result;
  }
  nextBytes1(out, length) {
    return this.nextBytes2(out, 0, length);
  }
  nextBytes2(out, start, count) {
    if (count == 0) {
      return out;
    }
    if (this._bytesGenerated + count > this._MAX_BYTES_TOTAL) {
      throw new Error(
        "Cannot generate more than a total of " + count + " bytes."
      );
    }
    try {
      var bytesWritten = 0;
      while (bytesWritten < count) {
        var bytesToWrite = Math.min(
          count - bytesWritten,
          this._MAX_BYTES_PER_REQUEST
        );
        out = this.hmacDrbgGenerate(out, start + bytesWritten, bytesToWrite);
        bytesWritten += bytesToWrite;
      }
    } finally {
      this._bytesGenerated += count;
    }
    return out;
  }
  hmacDrbgUpdate(providedData) {
    var tmp_array = "";
    tmp_array += this._value;
    tmp_array += this._BYTE_ARRAY_0;
    if (providedData != null) {
      tmp_array += providedData;
    }
    this.setKey(this.hash(tmp_array));
    this._value = this.hash(this._value);
    if (providedData == null) {
      return;
    }
    tmp_array = "";
    tmp_array += this._value;
    tmp_array += this._BYTE_ARRAY_1;
    if (providedData != null) {
      tmp_array += providedData;
    }
    this.setKey(this.hash(tmp_array));
    this._value = this.hash(this._value);
  }
  hmacDrbgGenerate(out, start, count) {
    var bytesWritten = 0;
    while (bytesWritten < count) {
      this._value = this.hash(this._value);
      var bytesToWrite = Math.min(count - bytesWritten, this._DIGEST_NUM_BYTES);
      for (var i = 0; i < bytesToWrite; i++) {
        out += this._value.charAt(i);
      }
      bytesWritten += bytesToWrite;
    }
    this.hmacDrbgUpdate(null);
    return out;
  }
} // end class
function generateRsaKeys(B, E, ba) {
  var tmp_private_key = sha256.rstr_sha256(bin2string(ba));
  var str = sha256.str2rstr_utf8(sha256.rstr2hex(tmp_private_key));
  var rng = new hmac_drbg(str, null);
  var qs = B >> 1;
  var key = new Object();
  key.e = parseInt(E, 16);
  var ee = new BigInteger(E, 16);
  for (;;) {
    for (;;) {
      key.p = bigRandom(B - qs, rng);
      if (
        key.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 &&
        key.p.isProbablePrime(10)
      )
        break;
    }
    for (;;) {
      key.q = bigRandom(qs, rng);
      if (
        key.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 &&
        key.q.isProbablePrime(10)
      )
        break;
    }
    if (key.p.compareTo(key.q) <= 0) {
      var t = key.p;
      key.p = key.q;
      key.q = t;
    }
    var p1 = key.p.subtract(BigInteger.ONE);
    var q1 = key.q.subtract(BigInteger.ONE);
    var phi = p1.multiply(q1);
    if (phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
      key.n = key.p.multiply(key.q);
      key.d = ee.modInverse(phi);
      key.dmp1 = key.d.mod(p1);
      key.dmq1 = key.d.mod(q1);
      key.coeff = key.q.modInverse(key.p);
      break;
    }
  }
  return key;
}
function strToHex(str) {
  for (var hex = [], i = 0; i < str.length; i++) {
    var m = str.charCodeAt(i);
    hex.push((m >>> 4).toString(16));
    hex.push((m & 0xf).toString(16));
  }
  return hex.join("");
}
function strToArray(str) {
  var arr = [];
  for (var i = 0; i < str.length; i++) {
    arr.push(parseInt(str.charCodeAt(i)));
  }
  return arr;
}
function arrayToStr(arr) {
  var str = "";
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }
  return str;
}
function bigRandom(bits, rnd) {
  if (bits < 2) return BigInteger.nbv(1);
  var x = rnd.nextBytes_to_buffer(bits >> 3);
  var b = new BigInteger(strToHex(x), 16);
  b.primify(bits, 1);
  return b;
}
function bin2string(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}
const restoreKeysFromSecret = (secret) => {
  var entropy = Base58.decode(secret);
  var version = entropy[0];
  entropy = entropy.slice(1);
  return generateFromEntropy(entropy, version, secret);
};
function signStr(str, publicKey, privateKey) {
  var rsa = new RSAKey();
  rsa.setPrivate(publicKey, "10001", privateKey);
  return rsa.sign(str, "sha256");
}

function generateKeys(version) {
  var entropy = [];

  for (var i = 0; i < 16; i++) {
    entropy.push(Math.floor(256 * Math.random()));
  }

  return generateFromEntropy(entropy, version, null);
}
export const xltLib = {
  restoreKeysFromSecret,
  signStr,
  generateKeys,
};
