export const pack = (mark: string, array: Array<number>): string => {
  if (!(array instanceof Array)) {
    throw new Error("'pack' error. Got invalid type argument.");
  }
  if (mark.length - 1 != array.length) {
    throw new Error(
      `'pack' error. ${mark.length - 1} marks, ${array.length} elements.`
    );
  }

  let littleEndian;
  if (mark[0] == "<") {
    littleEndian = true;
  } else if (mark[0] == ">") {
    littleEndian = false;
  } else {
    throw new Error("Not match any endian.");
  }
  let packed = "";
  let p = 1;
  let val = null;
  let c = null;
  let valBinary = null;

  while ((c = mark[p])) {
    if (c.toLowerCase() == "b") {
      val = array[p - 1];
      if (c == "b" && val < 0) {
        val += 0x100;
      }
      if (val > 0xff || val < 0) {
        throw new Error("'pack' error.");
      } else {
        valBinary = String.fromCharCode(val);
      }
    } else if (c == "H") {
      val = array[p - 1];
      if (val > 0xffff || val < 0) {
        throw new Error("'pack' error.");
      } else {
        valBinary =
          String.fromCharCode(Math.floor((val % 0x10000) / 0x100)) +
          String.fromCharCode(val % 0x100);
        if (littleEndian) {
          valBinary = valBinary
            .split("")
            .reverse()
            .join("");
        }
      }
    } else if (c.toLowerCase() == "l") {
      val = array[p - 1];
      if (c == "l" && val < 0) {
        val += 0x100000000;
      }
      if (val > 0xffffffff || val < 0) {
        throw new Error("'pack' error.");
      } else {
        valBinary =
          String.fromCharCode(Math.floor(val / 0x1000000)) +
          String.fromCharCode(Math.floor((val % 0x1000000) / 0x10000)) +
          String.fromCharCode(Math.floor((val % 0x10000) / 0x100)) +
          String.fromCharCode(val % 0x100);
        if (littleEndian) {
          valBinary = valBinary
            .split("")
            .reverse()
            .join("");
        }
      }
    } else {
      throw new Error("'pack' error.");
    }

    packed += valBinary;
    p += 1;
  }

  return packed;
};

export const unpack = (mark: string, str: string): number[] => {
  if (typeof str != "string") {
    throw new Error("'unpack' error. Got invalid type argument.");
  }
  let l = 0;
  for (let markPointer = 1; markPointer < mark.length; markPointer++) {
    if (mark[markPointer].toLowerCase() == "b") {
      l += 1;
    } else if (mark[markPointer].toLowerCase() == "h") {
      l += 2;
    } else if (mark[markPointer].toLowerCase() == "l") {
      l += 4;
    } else {
      throw new Error("'unpack' error. Got invalid mark.");
    }
  }

  if (l != str.length) {
    throw new Error(
      "'unpack' error. Mismatch between symbol and string length. " +
        l +
        ":" +
        str.length
    );
  }

  let littleEndian;
  if (mark[0] == "<") {
    littleEndian = true;
  } else if (mark[0] == ">") {
    littleEndian = false;
  } else {
    throw new Error("'unpack' error.");
  }
  const unpacked = [];
  let strPointer = 0;
  let p = 1;
  let val = null;
  let c = null;
  let length = null;
  let sliced = "";

  while ((c = mark[p])) {
    if (c.toLowerCase() == "b") {
      length = 1;
      sliced = str.slice(strPointer, strPointer + length);
      val = sliced.charCodeAt(0);
      if (c == "b" && val >= 0x80) {
        val -= 0x100;
      }
    } else if (c == "H") {
      length = 2;
      sliced = str.slice(strPointer, strPointer + length);
      if (littleEndian) {
        sliced = sliced
          .split("")
          .reverse()
          .join("");
      }
      val = sliced.charCodeAt(0) * 0x100 + sliced.charCodeAt(1);
    } else if (c.toLowerCase() == "l") {
      length = 4;
      sliced = str.slice(strPointer, strPointer + length);
      if (littleEndian) {
        sliced = sliced
          .split("")
          .reverse()
          .join("");
      }
      val =
        sliced.charCodeAt(0) * 0x1000000 +
        sliced.charCodeAt(1) * 0x10000 +
        sliced.charCodeAt(2) * 0x100 +
        sliced.charCodeAt(3);
      if (c == "l" && val >= 0x80000000) {
        val -= 0x100000000;
      }
    } else {
      throw new Error("'unpack' error. " + c);
    }

    unpacked.push(val);
    strPointer += length;
    p += 1;
  }

  return unpacked;
};
