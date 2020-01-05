const fs = require("fs");
const jpeg = require('jpeg-js');
const exifLib = require('../../dist/exif-library');

const ZEROTH_IFD = {
  [exifLib.TagNumbers.ImageIFD.Software]: "exif-library",
  [exifLib.TagNumbers.ImageIFD.Make]: "Make",
  [exifLib.TagNumbers.ImageIFD.Model]: "XXX-XXX",
  [exifLib.TagNumbers.ImageIFD.ResolutionUnit]: 65535,
  [exifLib.TagNumbers.ImageIFD.BitsPerSample]: [24, 24, 24],
  [exifLib.TagNumbers.ImageIFD.XResolution]: [4294967295, 1],
  [exifLib.TagNumbers.ImageIFD.BlackLevelDeltaH]: [[1, 1], [1, 1], [1, 1]],
};

const EXIF_IFD = {
  [exifLib.TagNumbers.ExifIFD.DateTimeOriginal]: "2099:09:29 10:10:10",
  [exifLib.TagNumbers.ExifIFD.LensMake]: "LensMake",
  [exifLib.TagNumbers.ExifIFD.OECF]: "\xaa\xaa\xaa\xaa\xaa\xaa",
  [exifLib.TagNumbers.ExifIFD.Sharpness]: 65535,
  [exifLib.TagNumbers.ExifIFD.ISOSpeed]: 4294967295,
  [exifLib.TagNumbers.ExifIFD.ExposureTime]: [4294967295, 1],
  [exifLib.TagNumbers.ExifIFD.LensSpecification]: [[1, 1], [1, 1], [1, 1], [1, 1]],
  [exifLib.TagNumbers.ExifIFD.ExposureBiasValue]: [2147483647, -2147483648],
};

const GPS_IFD = {
  [exifLib.TagNumbers.GPSIFD.GPSVersionID]: [0, 0, 0, 1],
  [exifLib.TagNumbers.GPSIFD.GPSAltitudeRef]: 1,
  [exifLib.TagNumbers.GPSIFD.GPSDateStamp]: "1999:99:99 99:99:99",
  [exifLib.TagNumbers.GPSIFD.GPSDifferential]: 65535,
  [exifLib.TagNumbers.GPSIFD.GPSLatitude]: [4294967295, 1],
};

const FIRST_IFD = {
  [exifLib.TagNumbers.ImageIFD.Software]: "PIL",
  [exifLib.TagNumbers.ImageIFD.Make]: "Make",
  [exifLib.TagNumbers.ImageIFD.Model]: "XXX-XXX",
  [exifLib.TagNumbers.ImageIFD.BitsPerSample]: [24, 24, 24],
  [exifLib.TagNumbers.ImageIFD.BlackLevelDeltaH]: [[1, 1], [1, 1], [1, 1]],
};

const INTEROP_IFD = {[exifLib.TagNumbers.InteropIFD.InteroperabilityIndex]: "R98"};

const THUMBNAIL_DATA = "\xFF\xD8\xFF\xE0\x00\x10\x4A\x46\x49\x46\x00\x01\x01\x01\x00\x60\x00\x60\x00\x00\xFF\xDB\x00\x43\x00\x02\x01\x01\x02\x01\x01\x02\x02\x02\x02\x02\x02\x02\x02\x03\x05\x03\x03\x03\x03\x03\x06\x04\x04\x03\x05\x07\x06\x07\x07\x07\x06\x07\x07\x08\x09\x0B\x09\x08\x08\x0A\x08\x07\x07\x0A\x0D\x0A\x0A\x0B\x0C\x0C\x0C\x0C\x07\x09\x0E\x0F\x0D\x0C\x0E\x0B\x0C\x0C\x0C\xFF\xDB\x00\x43\x01\x02\x02\x02\x03\x03\x03\x06\x03\x03\x06\x0C\x08\x07\x08\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\x0C\xFF\xC0\x00\x11\x08\x00\x01\x00\x01\x03\x01\x22\x00\x02\x11\x01\x03\x11\x01\xFF\xC4\x00\x1F\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\xFF\xC4\x00\xB5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01\x7D\x01\x02\x03\x00\x04\x11\x05\x12\x21\x31\x41\x06\x13\x51\x61\x07\x22\x71\x14\x32\x81\x91\xA1\x08\x23\x42\xB1\xC1\x15\x52\xD1\xF0\x24\x33\x62\x72\x82\x09\x0A\x16\x17\x18\x19\x1A\x25\x26\x27\x28\x29\x2A\x34\x35\x36\x37\x38\x39\x3A\x43\x44\x45\x46\x47\x48\x49\x4A\x53\x54\x55\x56\x57\x58\x59\x5A\x63\x64\x65\x66\x67\x68\x69\x6A\x73\x74\x75\x76\x77\x78\x79\x7A\x83\x84\x85\x86\x87\x88\x89\x8A\x92\x93\x94\x95\x96\x97\x98\x99\x9A\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFF\xC4\x00\x1F\x01\x00\x03\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\xFF\xC4\x00\xB5\x11\x00\x02\x01\x02\x04\x04\x03\x04\x07\x05\x04\x04\x00\x01\x02\x77\x00\x01\x02\x03\x11\x04\x05\x21\x31\x06\x12\x41\x51\x07\x61\x71\x13\x22\x32\x81\x08\x14\x42\x91\xA1\xB1\xC1\x09\x23\x33\x52\xF0\x15\x62\x72\xD1\x0A\x16\x24\x34\xE1\x25\xF1\x17\x18\x19\x1A\x26\x27\x28\x29\x2A\x35\x36\x37\x38\x39\x3A\x43\x44\x45\x46\x47\x48\x49\x4A\x53\x54\x55\x56\x57\x58\x59\x5A\x63\x64\x65\x66\x67\x68\x69\x6A\x73\x74\x75\x76\x77\x78\x79\x7A\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x92\x93\x94\x95\x96\x97\x98\x99\x9A\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFF\xDA\x00\x0C\x03\x01\x00\x02\x11\x03\x11\x00\x3F\x00\xFD\xFC\xA2\x8A\x28\x03\xFF\xD9";

const EXIF_OBJ = {
  "0th": ZEROTH_IFD,
  "Exif": EXIF_IFD,
  "GPS": GPS_IFD,
  "1st": FIRST_IFD,
  "Interop": INTEROP_IFD,
  "thumbnail": THUMBNAIL_DATA
};

test('"load" returns a object contains IFD -- 1', () => {
  const jpegBytes = fs.readFileSync("./tests/files/r_canon.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBytes);
  expect(Object.keys(exifObj)).toContain('0th');
});

test('"load" returns correct value" -- 1', () => {
  const exifBytes = 'Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x02\x01\x00\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x01\x01\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x00\x00\x00\x00';
  const correctObj = {
    '0th': {
      [exifLib.TagNumbers.ImageIFD.ImageWidth]: 10,
      [exifLib.TagNumbers.ImageIFD.ImageLength]: 10
    }
  };
  const exifObj = exifLib.load(exifBytes);
  expect(exifObj).toEqual(correctObj);
});

test('"dump" returns correct value" -- 1', () => {
  const exifObj = {
    '0th': {
      [exifLib.TagNumbers.ImageIFD.ImageWidth]: 10,
      [exifLib.TagNumbers.ImageIFD.ImageLength]: 10
    }
  };
  const exifBytes = exifLib.dump(exifObj);
  const correctBytes = 'Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x02\x01\x00\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x01\x01\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x00\x00\x00\x00';
  expect(exifBytes).toBe(correctBytes);
});

test('"dump" throws "ValueConvertError"" -- 1', () => {
  const exifObj = {
    '0th': {
      [exifLib.TagNumbers.ImageIFD.ImageWidth]: "10"
    }
  };
  expect(
    () => { exifLib.dump(exifObj); }
  ).toThrow(exifLib.ValueConvertError);
});

test('Compare "load" output with some correct values - BIG ENDIAN FILE - 1', () => {
  const jpegBytes = fs.readFileSync("./tests/files/r_canon.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBytes);
  expect(exifObj['0th'][exifLib.TagNumbers.ImageIFD.Make]).toBe('Canon');
  expect(exifObj['0th'][exifLib.TagNumbers.ImageIFD.Orientation]).toBe(1);
  expect(exifObj['Exif'][exifLib.TagNumbers.ExifIFD.ExposureTime]).toEqual([1, 50]);
  expect(exifObj['Exif'][exifLib.TagNumbers.ExifIFD.PixelXDimension]).toBe(4352);
});

test('Compare "load" output with soem correct values - LITTLE ENDIAN FILE - 1', () => {
  const jpegBytes = fs.readFileSync("./tests/files/r_sony.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBytes);
  expect(exifObj['0th'][exifLib.TagNumbers.ImageIFD.Make]).toBe('SONY');
  expect(exifObj['0th'][exifLib.TagNumbers.ImageIFD.Orientation]).toBe(1);
  expect(exifObj['Exif'][exifLib.TagNumbers.ExifIFD.ExposureTime]).toEqual([1, 125]);
  expect(exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormatLength]).toBe(13127);
});

test('round trip "load" and "dump" -- 1', () => {
  const jpegBytes = fs.readFileSync("./tests/files/r_sony.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBytes);
  const exifBytes = exifLib.dump(exifObj);
  const _exifObj = exifLib.load(exifBytes);

  // remove pointer values
  delete exifObj['0th'][exifLib.TagNumbers.ImageIFD.ExifTag];
  delete _exifObj['0th'][exifLib.TagNumbers.ImageIFD.ExifTag];
  delete exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormat];
  delete _exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormat];
  delete exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormatLength];
  delete _exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormatLength];
  delete exifObj['Exif'][exifLib.TagNumbers.ExifIFD.InteroperabilityTag];
  delete _exifObj['Exif'][exifLib.TagNumbers.ExifIFD.InteroperabilityTag];

  expect(exifObj).toEqual(_exifObj);
});

test('round trip "dump" and "load" -- 1', () => {
  let exifObj = {};
  Object.assign(exifObj, EXIF_OBJ);
  const exifBytes = exifLib.dump(EXIF_OBJ);
  const _exifObj = exifLib.load(exifBytes);

  // remove pointer values
  delete exifObj['0th'][exifLib.TagNumbers.ImageIFD.ExifTag];
  delete _exifObj['0th'][exifLib.TagNumbers.ImageIFD.ExifTag];
  delete exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormat];
  delete _exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormat];
  delete exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormatLength];
  delete _exifObj['1st'][exifLib.TagNumbers.ImageIFD.JPEGInterchangeFormatLength];
  delete exifObj['Exif'][exifLib.TagNumbers.ExifIFD.InteroperabilityTag];
  delete _exifObj['Exif'][exifLib.TagNumbers.ExifIFD.InteroperabilityTag];
  delete exifObj['thumbnail'];
  delete _exifObj['thumbnail'];
  
  expect(exifObj).toEqual(exifObj);
});

test('success remove -- 1', () => {
  const jpegBytes = fs.readFileSync("./tests/files/r_pana.jpg").toString("binary");
  const exifObj = exifLib.load(jpegBytes);
  expect(Object.keys(exifObj)).toContain('0th');
  const jpegBytesRemovedExif = exifLib.remove(jpegBytes);
  const exifObjRemovedExif = exifLib.load(jpegBytesRemovedExif);
  expect(exifObjRemovedExif).toEqual({});
});

test('success insert -- 1', () => {
  const jpegBytes = fs.readFileSync("./tests/files/noexif.jpg").toString("binary");
  const exifBytes = 'Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x02\x01\x00\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x01\x01\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x00\x00\x00\x00';
  const jpegBytesExifInsert = exifLib.insert(exifBytes, jpegBytes);
  const buffer = Buffer.from(jpegBytesExifInsert, 'ascii');
  jpeg.decode(buffer, true);
  expect(jpegBytesExifInsert).toMatch(exifBytes);
});
