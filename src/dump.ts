import * as utils from "./utils";
import * as struct from "./struct";
import * as binary from "./binary";
import * as segment from "./segment";
import { Types, IExif, IExifElement } from "./interfaces";
import { TagNumbers } from "./constants";

export const dump = (originalExifObj: IExif): string => {
  const TIFF_HEADER_LENGTH = 8;

  const exifObj: IExif = utils.copyObject(originalExifObj);
  const header = "Exif\x00\x00\x4d\x4d\x00\x2a\x00\x00\x00\x08";
  let existExifIfd = false;
  let existGpsIfd = false;
  let existInteropIfd = false;
  let existFirstIfd = false;

  let zerothIfd: IExifElement,
    exifIfd: IExifElement,
    interopIfd: IExifElement,
    gpsIfd: IExifElement,
    firstIfd: IExifElement;

  if ("0th" in exifObj) {
    zerothIfd = exifObj["0th"];
  } else {
    zerothIfd = {};
  }

  if (
    Object.keys(exifObj?.Exif ?? {}).length ||
    Object.keys(exifObj?.Interop ?? {}).length
  ) {
    zerothIfd[TagNumbers.ImageIFD.ExifTag] = 1;
    existExifIfd = true;
    exifIfd = exifObj["Exif"];
    if (Object.keys(exifObj?.Interop ?? {}).length) {
      exifIfd[TagNumbers.ExifIFD.InteroperabilityTag] = 1;
      existInteropIfd = true;
      interopIfd = exifObj["Interop"];
    } else if (
      exifIfd.hasOwnProperty(TagNumbers.ExifIFD.InteroperabilityTag.toString())
    ) {
      delete exifIfd[TagNumbers.ExifIFD.InteroperabilityTag];
    }
  } else if (zerothIfd.hasOwnProperty(TagNumbers.ImageIFD.ExifTag.toString())) {
    delete zerothIfd[TagNumbers.ImageIFD.ExifTag];
  }

  if (Object.keys(exifObj?.GPS ?? {}).length) {
    zerothIfd[TagNumbers.ImageIFD.GPSTag] = 1;
    existGpsIfd = true;
    gpsIfd = exifObj["GPS"];
  } else if (zerothIfd.hasOwnProperty(TagNumbers.ImageIFD.GPSTag.toString())) {
    delete zerothIfd[TagNumbers.ImageIFD.GPSTag];
  }

  if (
    exifObj.hasOwnProperty("1st") &&
    exifObj.hasOwnProperty("thumbnail") &&
    exifObj["thumbnail"] != null
  ) {
    existFirstIfd = true;
    exifObj["1st"][TagNumbers.ImageIFD.JPEGInterchangeFormat] = 1;
    exifObj["1st"][TagNumbers.ImageIFD.JPEGInterchangeFormatLength] = 1;
    firstIfd = exifObj["1st"];
  }

  const zerothIfdSet = binary.dictToBytes(zerothIfd, "0th", 0);
  const zerothIfdLength =
    zerothIfdSet[0].length +
    Number(existExifIfd) * 12 +
    Number(existGpsIfd) * 12 +
    4 +
    zerothIfdSet[1].length;

  let exifIfdSet,
    exifIfdBytes = "",
    exifIfdLength = 0,
    gpsIfdSet,
    gpsIfdBytes = "",
    gpsIfdLength = 0,
    interopIfdSet,
    interopIfdBytes = "",
    interopIfdLength = 0,
    firstIfdSet,
    firstIfdBytes = "",
    thumbnail;
  if (existExifIfd) {
    exifIfdSet = binary.dictToBytes(exifIfd, "Exif", zerothIfdLength);
    exifIfdLength =
      exifIfdSet[0].length +
      Number(existInteropIfd) * 12 +
      exifIfdSet[1].length;
  }
  if (existGpsIfd) {
    gpsIfdSet = binary.dictToBytes(
      gpsIfd,
      "GPS",
      zerothIfdLength + exifIfdLength
    );
    gpsIfdBytes = gpsIfdSet.join("");
    gpsIfdLength = gpsIfdBytes.length;
  }
  if (existInteropIfd) {
    const offset = zerothIfdLength + exifIfdLength + gpsIfdLength;
    interopIfdSet = binary.dictToBytes(interopIfd, "Interop", offset);
    interopIfdBytes = interopIfdSet.join("");
    interopIfdLength = interopIfdBytes.length;
  }
  if (existFirstIfd) {
    const offset =
      zerothIfdLength + exifIfdLength + gpsIfdLength + interopIfdLength;
    firstIfdSet = binary.dictToBytes(firstIfd, "1st", offset);
    thumbnail = segment.getThumbnail(exifObj["thumbnail"]);
    if (thumbnail.length > 64000) {
      throw new Error("Given thumbnail is too large. max 64kB");
    }
  }

  let exifPointer = "",
    gpsPointer = "",
    interopPointer = "",
    firstIfdPointer = "\x00\x00\x00\x00";
  if (existExifIfd) {
    const pointerValue = TIFF_HEADER_LENGTH + zerothIfdLength;
    const pointerBytes = struct.pack(">L", [pointerValue]);
    const key = TagNumbers.ImageIFD.ExifTag;
    const keyBytes = struct.pack(">H", [key]);
    const typeBytes = struct.pack(">H", [Types["Long"]]);
    const lengthBytes = struct.pack(">L", [1]);
    exifPointer = keyBytes + typeBytes + lengthBytes + pointerBytes;
  }
  if (existGpsIfd) {
    const pointerValue = TIFF_HEADER_LENGTH + zerothIfdLength + exifIfdLength;
    const pointerBytes = struct.pack(">L", [pointerValue]);
    const key = TagNumbers.ImageIFD.GPSTag;
    const keyBytes = struct.pack(">H", [key]);
    const typeBytes = struct.pack(">H", [Types["Long"]]);
    const lengthBytes = struct.pack(">L", [1]);
    gpsPointer = keyBytes + typeBytes + lengthBytes + pointerBytes;
  }
  if (existInteropIfd) {
    const pointerValue =
      TIFF_HEADER_LENGTH + zerothIfdLength + exifIfdLength + gpsIfdLength;
    const pointerBytes = struct.pack(">L", [pointerValue]);
    const key = TagNumbers.ExifIFD.InteroperabilityTag;
    const keyBytes = struct.pack(">H", [key]);
    const typeBytes = struct.pack(">H", [Types["Long"]]);
    const lengthBytes = struct.pack(">L", [1]);
    interopPointer = keyBytes + typeBytes + lengthBytes + pointerBytes;
  }
  if (existFirstIfd) {
    const pointerValue =
      TIFF_HEADER_LENGTH +
      zerothIfdLength +
      exifIfdLength +
      gpsIfdLength +
      interopIfdLength;
    firstIfdPointer = struct.pack(">L", [pointerValue]);
    const thumbnailPointer =
      pointerValue + firstIfdSet[0].length + 24 + 4 + firstIfdSet[1].length;
    const thumbnailPointerBytes =
      "\x02\x01\x00\x04\x00\x00\x00\x01" +
      struct.pack(">L", [thumbnailPointer]);
    const thumbnailLengthBytes =
      "\x02\x02\x00\x04\x00\x00\x00\x01" +
      struct.pack(">L", [thumbnail.length]);
    firstIfdBytes =
      firstIfdSet[0] +
      thumbnailPointerBytes +
      thumbnailLengthBytes +
      "\x00\x00\x00\x00" +
      firstIfdSet[1] +
      thumbnail;
  }

  const zerothIfdBytes =
    zerothIfdSet[0] +
    exifPointer +
    gpsPointer +
    firstIfdPointer +
    zerothIfdSet[1];
  if (existExifIfd) {
    exifIfdBytes = exifIfdSet[0] + interopPointer + exifIfdSet[1];
  }

  return (
    header +
    zerothIfdBytes +
    exifIfdBytes +
    gpsIfdBytes +
    interopIfdBytes +
    firstIfdBytes
  );
};
