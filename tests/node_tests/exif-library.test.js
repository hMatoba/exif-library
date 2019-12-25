const fs = require("fs");
const jpeg = require('jpeg-js');

const exifLib = require('../../dist/exif-library');

test('"load" returns a object contains IFD -- 1', () => {
  const jpegBinary = fs.readFileSync("./tests/files/r_canon.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBinary);
  expect(Object.keys(exifObj)).toContain('0th');
});

test('"load" returns correct value" -- 1', () => {
  const exifBinary = 'Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x02\x01\x00\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x01\x01\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x00\x00\x00\x00';
  const correctObj = {
    '0th': {
      [exifLib.TagValues.ImageIFD.ImageWidth]: 10,
      [exifLib.TagValues.ImageIFD.ImageLength]: 10
    }
  };
  const exifObj = exifLib.load(exifBinary);
  expect(exifObj).toEqual(correctObj);
});

test('"dump" returns correct value" -- 1', () => {
  const exifObj = {
    '0th': {
      [exifLib.TagValues.ImageIFD.ImageWidth]: 10,
      [exifLib.TagValues.ImageIFD.ImageLength]: 10
    }
  };
  const exifBinary = exifLib.dump(exifObj);
  const correctBinary = 'Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x02\x01\x00\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x01\x01\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x00\x00\x00\x00';
  expect(exifBinary).toBe(correctBinary);
});

test('"dump" throws "ValueConvertError"" -- 1', () => {
  const exifObj = {
    '0th': {
      [exifLib.TagValues.ImageIFD.ImageWidth]: "10"
    }
  };
  expect(
    () => { exifLib.dump(exifObj); }
  ).toThrow(exifLib.ValueConvertError);
});

test('Compare "load" output with some correct values - BIG ENDIAN FILE - 1', () => {
  const jpegBinary = fs.readFileSync("./tests/files/r_canon.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBinary);
  expect(exifObj['0th'][exifLib.TagValues.ImageIFD.Make]).toBe('Canon');
  expect(exifObj['0th'][exifLib.TagValues.ImageIFD.Orientation]).toBe(1);
  expect(exifObj['Exif'][exifLib.TagValues.ExifIFD.ExposureTime]).toEqual([1, 50]);
  expect(exifObj['Exif'][exifLib.TagValues.ExifIFD.PixelXDimension]).toBe(4352);
});

test('Compare "load" output with soem correct values - LITTLE ENDIAN FILE - 1', () => {
  const jpegBinary = fs.readFileSync("./tests/files/r_sony.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBinary);
  expect(exifObj['0th'][exifLib.TagValues.ImageIFD.Make]).toBe('SONY');
  expect(exifObj['0th'][exifLib.TagValues.ImageIFD.Orientation]).toBe(1);
  expect(exifObj['Exif'][exifLib.TagValues.ExifIFD.ExposureTime]).toEqual([1, 125]);
  expect(exifObj['1st'][exifLib.TagValues.ImageIFD.JPEGInterchangeFormatLength]).toBe(13127);
});

test('round trip "load" and "dump" -- 1', () => {
  const jpegBinary = fs.readFileSync("./tests/files/r_sony.jpg").toString("binary");
  const exifObj1 = exifLib.load(jpegBinary);
  const exifBinary = exifLib.dump(exifObj1);
  const exifObj2 = exifLib.load(exifBinary);

  // remove pointer values
  delete exifObj1['0th'][exifLib.TagValues.ImageIFD.ExifTag];
  delete exifObj2['0th'][exifLib.TagValues.ImageIFD.ExifTag];
  delete exifObj1['1st'][exifLib.TagValues.ImageIFD.JPEGInterchangeFormat];
  delete exifObj2['1st'][exifLib.TagValues.ImageIFD.JPEGInterchangeFormat];
  delete exifObj1['1st'][exifLib.TagValues.ImageIFD.JPEGInterchangeFormatLength];
  delete exifObj2['1st'][exifLib.TagValues.ImageIFD.JPEGInterchangeFormatLength];
  delete exifObj1['Exif'][exifLib.TagValues.ExifIFD.InteroperabilityTag];
  delete exifObj2['Exif'][exifLib.TagValues.ExifIFD.InteroperabilityTag];

  expect(exifObj1).toEqual(exifObj2);
});

test('success remove -- 1', () => {
  const jpegBinary = fs.readFileSync("./tests/files/r_pana.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBinary);
  expect(Object.keys(exifObj)).toContain('0th');
  const jpegBinaryRemovedExif = exifLib.remove(jpegBinary);
  const exifObjRemovedExif = exifLib.load(jpegBinaryRemovedExif);
  expect(exifObjRemovedExif).toEqual({});
});

test('success insert -- 1', () => {
  const jpegBinary = fs.readFileSync("./tests/files/noexif.jpg").toString("binary");
  const exifBinary = 'Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x02\x01\x00\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x01\x01\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x00\x00\x00\x00';
  const jpegBinaryExifInsert = exifLib.insert(exifBinary, jpegBinary);
  const buffer = Buffer.from(jpegBinaryExifInsert, 'ascii');
  jpeg.decode(buffer, true);
  expect(jpegBinaryExifInsert).toMatch(exifBinary);
});
