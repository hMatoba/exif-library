import { Types, TagsFieldNames, IExifElement } from "./interfaces";
import { Tags } from "./constants";
import * as utils from "./utils";
import * as struct from "./struct";
import * as exceptions from "./exceptions";

interface ITagBinary {
  value: string;
  lengthBinary: string;
  fourBytesOver: string;
}

const packByte = (array: Array<number>): string => {
  return struct.pack(">" + utils.repeatString("B", array.length), array);
};

const packShort = (array: Array<number>): string => {
  return struct.pack(">" + utils.repeatString("H", array.length), array);
};

const packLong = (array: Array<number>): string => {
  return struct.pack(">" + utils.repeatString("L", array.length), array);
};

const toByte = (rawValue: number | number[], offset: number): ITagBinary => {
  if (typeof rawValue == "number") {
    rawValue = [rawValue];
  } else if (Array.isArray(rawValue) && typeof rawValue[0] === "number") {
    // pass
  } else {
    const t = Array.isArray(rawValue) ? "Array" : typeof rawValue;
    throw new exceptions.ValueConvertError(
      `Value must be "number" or "Array<number>".\n` +
        `Value: ${rawValue}\n` +
        `Type: ${t}`
    );
  }

  const length = rawValue.length;
  const tagBinary: ITagBinary = {
    value: "",
    lengthBinary: "",
    fourBytesOver: ""
  };
  if (length <= 4) {
    tagBinary.value =
      packByte(rawValue) + utils.repeatString("\x00", 4 - length);
  } else {
    tagBinary.value = struct.pack(">L", [offset]);
    tagBinary.fourBytesOver = packByte(rawValue);
  }
  tagBinary.lengthBinary = struct.pack(">L", [length]);
  return tagBinary;
};

const toAscii = (rawValue: string, offset: number): ITagBinary => {
  if (typeof rawValue !== "string") {
    const t = Array.isArray(rawValue) ? "Array" : typeof rawValue;
    throw new exceptions.ValueConvertError(
      `Value must be "string". Got "${t}".`
    );
  }

  const newValue = rawValue + "\x00";
  const length = newValue.length;
  const tagBinary: ITagBinary = {
    value: "",
    lengthBinary: "",
    fourBytesOver: ""
  };
  if (length > 4) {
    tagBinary.value = struct.pack(">L", [offset]);
    tagBinary.fourBytesOver = newValue;
  } else {
    tagBinary.value = newValue + utils.repeatString("\x00", 4 - length);
  }
  tagBinary.lengthBinary = struct.pack(">L", [length]);
  return tagBinary;
};

const toShort = (rawValue: number | number[], offset: number): ITagBinary => {
  if (typeof rawValue == "number") {
    rawValue = [rawValue];
  } else if (Array.isArray(rawValue) && typeof rawValue[0] === "number") {
    // pass
  } else {
    const t = Array.isArray(rawValue) ? "Array" : typeof rawValue;
    throw new exceptions.ValueConvertError(
      `Value must be "number" or "Array<number>".\n` +
        `Value: ${rawValue}\n` +
        `Type: ${t}`
    );
  }

  const length = rawValue.length;
  const tagBinary: ITagBinary = {
    value: "",
    lengthBinary: "",
    fourBytesOver: ""
  };
  if (length <= 2) {
    tagBinary.value =
      packShort(rawValue) + utils.repeatString("\x00\x00", 2 - length);
  } else {
    tagBinary.value = struct.pack(">L", [offset]);
    tagBinary.fourBytesOver = packShort(rawValue);
  }
  tagBinary.lengthBinary = struct.pack(">L", [length]);
  return tagBinary;
};

const toLong = (rawValue: number | number[], offset: number): ITagBinary => {
  if (typeof rawValue == "number") {
    rawValue = [rawValue];
  } else if (Array.isArray(rawValue) && typeof rawValue[0] === "number") {
    // pass
  } else {
    const t = Array.isArray(rawValue) ? "Array" : typeof rawValue;
    throw new exceptions.ValueConvertError(
      `Value must be "number" or "Array<number>".\n` +
        `Value: ${rawValue}\n` +
        `Type: ${t}`
    );
  }

  const length = rawValue.length;
  const tagBinary: ITagBinary = {
    value: "",
    lengthBinary: "",
    fourBytesOver: ""
  };
  if (length <= 1) {
    tagBinary.value = packLong(rawValue);
  } else {
    tagBinary.value = struct.pack(">L", [offset]);
    tagBinary.fourBytesOver = packLong(rawValue);
  }
  tagBinary.lengthBinary = struct.pack(">L", [length]);
  return tagBinary;
};

const toRational = (
  rawValue: number[] | number[][],
  offset: number
): ITagBinary => {
  let value: number[][];
  if (
    Array.isArray(rawValue) &&
    typeof rawValue[0] === "number" &&
    rawValue.length === 2
  ) {
    value = [rawValue as number[]];
  } else if (
    Array.isArray(rawValue) &&
    Array.isArray(rawValue[0]) &&
    typeof (rawValue as number[][])[0][0] === "number"
  ) {
    value = rawValue as number[][];
  } else {
    let t = Array.isArray(rawValue) ? "Array" : typeof rawValue;
    t = t == "Array" ? `Array<${typeof rawValue[0]}>` : t;
    throw new exceptions.ValueConvertError(
      `Value must be "Array<number>" or "Array<Array<number>>". Got "${t}".`
    );
  }

  const tagBinary: ITagBinary = {
    value: "",
    lengthBinary: "",
    fourBytesOver: ""
  };
  const length = value.length;
  let newValue = "";
  for (let n = 0; n < length; n++) {
    const num = value[n][0];
    const den = value[n][1];
    newValue += struct.pack(">L", [num]) + struct.pack(">L", [den]);
  }
  tagBinary.lengthBinary = struct.pack(">L", [length]);
  tagBinary.value = struct.pack(">L", [offset]);
  tagBinary.fourBytesOver = newValue;
  return tagBinary;
};

const toUndefined = (rawValue: string, offset: number): ITagBinary => {
  if (typeof rawValue !== "string") {
    const t = Array.isArray(rawValue) ? "Array" : typeof rawValue;
    throw new exceptions.ValueConvertError(
      `Value must be "string". Got "${t}".`
    );
  }

  const length = rawValue.length;
  const tagBinary: ITagBinary = {
    value: "",
    lengthBinary: "",
    fourBytesOver: ""
  };
  if (length > 4) {
    tagBinary.value = struct.pack(">L", [offset]);
    tagBinary.fourBytesOver = rawValue;
  } else {
    tagBinary.value = rawValue + utils.repeatString("\x00", 4 - length);
  }
  tagBinary.lengthBinary = struct.pack(">L", [length]);
  return tagBinary;
};

const toSRational = (
  rawValue: number[] | number[][],
  offset: number
): ITagBinary => {
  let value: number[][];
  if (
    Array.isArray(rawValue) &&
    typeof rawValue[0] === "number" &&
    rawValue.length === 2
  ) {
    value = [rawValue as number[]];
  } else if (
    Array.isArray(rawValue) &&
    Array.isArray(rawValue[0]) &&
    typeof (rawValue as number[][])[0][0] === "number"
  ) {
    // pass
  } else {
    let t = Array.isArray(rawValue) ? "Array" : typeof rawValue;
    t = t == "Array" ? `Array<${typeof rawValue[0]}>` : t;
    throw new exceptions.ValueConvertError(
      `Value must be "Array<number>" or "Array<Array<number>>". Got "${t}".`
    );
  }

  const tagBinary: ITagBinary = {
    value: "",
    lengthBinary: "",
    fourBytesOver: ""
  };
  const length = value.length;
  let newValue = "";
  for (let n = 0; n < length; n++) {
    const num = value[n][0];
    const den = value[n][1];
    newValue += struct.pack(">l", [num]) + struct.pack(">l", [den]);
  }
  tagBinary.lengthBinary = struct.pack(">L", [length]);
  tagBinary.value = struct.pack(">L", [offset]);
  tagBinary.fourBytesOver = newValue;
  return tagBinary;
};

const valueToBytes = (
  rawValue: string | number | number[] | number[][],
  valueType: number,
  offset: number
): ITagBinary => {
  let tagBinary;
  if (valueType == Types.Byte) {
    tagBinary = toByte(rawValue as number | number[], offset);
  } else if (valueType == Types.Ascii) {
    tagBinary = toAscii(rawValue as string, offset);
  } else if (valueType == Types.Short) {
    tagBinary = toShort(rawValue as number | number[], offset);
  } else if (valueType == Types.Long) {
    tagBinary = toLong(rawValue as number | number[], offset);
  } else if (valueType == Types.Rational) {
    tagBinary = toRational(rawValue as number[] | number[][], offset);
  } else if (valueType == Types.Undefined) {
    tagBinary = toUndefined(rawValue as string, offset);
  } else if (valueType == Types.SLong) {
    throw new Error("Not implemented for SLong value");
  } else if (valueType == Types.SRational) {
    tagBinary = toSRational(rawValue as number[] | number[][], offset);
  } else {
    throw new Error("Got unhandled exif value type.");
  }

  return tagBinary;
};

export const dictToBytes = (
  ifdObj: IExifElement,
  ifdName: TagsFieldNames,
  ifdOffsetCount: number
): string[] => {
  const TIFF_HEADER_LENGTH = 8;
  const tagCount = Object.keys(ifdObj).length;
  const entryHeader = struct.pack(">H", [tagCount]);
  let entriesLength;
  if (["0th", "1st"].indexOf(ifdName) > -1) {
    entriesLength = 2 + tagCount * 12 + 4;
  } else {
    entriesLength = 2 + tagCount * 12;
  }
  let entries = "";
  let values = "";
  let key;

  for (key in ifdObj) {
    if (typeof key == "string") {
      key = parseInt(key);
    }
    if (ifdName == "0th" && [34665, 34853].indexOf(key) > -1) {
      continue;
    } else if (ifdName == "Exif" && key == 40965) {
      continue;
    } else if (ifdName == "1st" && [513, 514].indexOf(key) > -1) {
      continue;
    }

    const rawValue = ifdObj[key];
    const keyBinary = struct.pack(">H", [key]);
    const valueType: number = Tags[ifdName][key]["type"];
    const typeBinary = struct.pack(">H", [valueType]);

    const offset =
      TIFF_HEADER_LENGTH + entriesLength + ifdOffsetCount + values.length;
    let b: ITagBinary;
    try {
      b = valueToBytes(rawValue, valueType, offset);
    } catch (e) {
      if (e instanceof exceptions.ValueConvertError) {
        const _ifdName = ["0th", "1st"].includes(ifdName) ? "Image" : ifdName;
        const tagName = Tags[_ifdName][key]["name"];
        const errorMessage = `Can't convert ${tagName} in ${ifdName} IFD.\r`;
        e.message = errorMessage + e.message;
      }
      throw e;
    }

    entries += keyBinary + typeBinary + b.lengthBinary + b.value;
    values += b.fourBytesOver;
  }
  return [entryHeader + entries, values];
};
