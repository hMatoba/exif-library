import * as utils from "./utils";
import * as struct from "./struct";
import * as segment from "./segment";
import { TagsFieldNames, IExifElement } from "./interfaces";
import { Tags } from "./constants";

export class ExifReader {
  tiftag: string;
  endianMark: string;

  constructor(exifBinary: string) {
    let segments, app1;
    if (exifBinary.slice(0, 2) == "\xff\xd8") {
      // JPEG
      segments = segment.splitIntoSegments(exifBinary);
      app1 = segment.getExifSeg(segments);
      if (app1) {
        this.tiftag = app1.slice(10);
      } else {
        this.tiftag = null;
      }
    } else if (["\x49\x49", "\x4d\x4d"].indexOf(exifBinary.slice(0, 2)) > -1) {
      // TIFF
      this.tiftag = exifBinary;
    } else if (exifBinary.slice(0, 4) == "Exif") {
      // Exif
      this.tiftag = exifBinary.slice(6);
    } else {
      throw new Error("Given file is neither JPEG nor TIFF.");
    }
  }

  getIfd = (pointer: number, ifdName: TagsFieldNames): IExifElement => {
    const tagCount = struct.unpack(
      this.endianMark + "H",
      this.tiftag.slice(pointer, pointer + 2)
    )[0];
    if (tagCount == 0) {
      return null;
    }
    const ifdObj: IExifElement = {};
    const offset = pointer + 2;
    let t: TagsFieldNames;
    if (["0th", "1st"].indexOf(ifdName) > -1) {
      t = "Image";
    } else {
      t = ifdName;
    }

    for (let x = 0; x < tagCount; x++) {
      pointer = offset + 12 * x;
      const tag = struct.unpack(
        this.endianMark + "H",
        this.tiftag.slice(pointer, pointer + 2)
      )[0];
      const type = struct.unpack(
        this.endianMark + "H",
        this.tiftag.slice(pointer + 2, pointer + 4)
      )[0];
      const length = struct.unpack(
        this.endianMark + "L",
        this.tiftag.slice(pointer + 4, pointer + 8)
      )[0];
      const value = this.tiftag.slice(pointer + 8, pointer + 12);

      const field: utils.IfdField = {
        type,
        length,
        value
      };
      if (tag in Tags[t]) {
        ifdObj[tag] = this.convertValue(field);
      }
    }

    return ifdObj;
  };

  getFirstIfdPointer = (pointer: number, ifdName: TagsFieldNames): string => {
    const tagCount = struct.unpack(
      this.endianMark + "H",
      this.tiftag.slice(pointer, pointer + 2)
    )[0];
    if (tagCount == 0) {
      return null;
    }
    const offset = pointer + 2;
    let firstIfdPointer: string;
    if (ifdName == "0th") {
      pointer = offset + 12 * tagCount;
      firstIfdPointer = this.tiftag.slice(pointer, pointer + 4);
    }

    return firstIfdPointer;
  };

  convertValue = (
    field: utils.IfdField
  ): string | number | number[] | number[][] => {
    let data = null;
    const t = field.type;
    const length = field.length;
    const value = field.value;
    let pointer;

    if (t == 1) {
      // BYTE
      if (length > 4) {
        pointer = struct.unpack(this.endianMark + "L", value)[0];
        data = struct.unpack(
          this.endianMark + utils.repeatString("B", length),
          this.tiftag.slice(pointer, pointer + length)
        );
      } else {
        data = struct.unpack(
          this.endianMark + utils.repeatString("B", length),
          value.slice(0, length)
        );
      }
    } else if (t == 2) {
      // ASCII
      if (length > 4) {
        pointer = struct.unpack(this.endianMark + "L", value)[0];
        data = this.tiftag.slice(pointer, pointer + length - 1);
      } else {
        data = value.slice(0, length - 1);
      }
    } else if (t == 3) {
      // SHORT
      if (length > 2) {
        pointer = struct.unpack(this.endianMark + "L", value)[0];
        data = struct.unpack(
          this.endianMark + utils.repeatString("H", length),
          this.tiftag.slice(pointer, pointer + length * 2)
        );
      } else {
        data = struct.unpack(
          this.endianMark + utils.repeatString("H", length),
          value.slice(0, length * 2)
        );
      }
    } else if (t == 4) {
      // LONG
      if (length > 1) {
        pointer = struct.unpack(this.endianMark + "L", value)[0];
        data = struct.unpack(
          this.endianMark + utils.repeatString("L", length),
          this.tiftag.slice(pointer, pointer + length * 4)
        );
      } else {
        data = struct.unpack(
          this.endianMark + utils.repeatString("L", length),
          value
        );
      }
    } else if (t == 5) {
      // RATIONAL
      pointer = struct.unpack(this.endianMark + "L", value)[0];
      if (length > 1) {
        data = [];
        for (let x = 0; x < length; x++) {
          data.push([
            struct.unpack(
              this.endianMark + "L",
              this.tiftag.slice(pointer + x * 8, pointer + 4 + x * 8)
            )[0],
            struct.unpack(
              this.endianMark + "L",
              this.tiftag.slice(pointer + 4 + x * 8, pointer + 8 + x * 8)
            )[0]
          ]);
        }
      } else {
        data = [
          struct.unpack(
            this.endianMark + "L",
            this.tiftag.slice(pointer, pointer + 4)
          )[0],
          struct.unpack(
            this.endianMark + "L",
            this.tiftag.slice(pointer + 4, pointer + 8)
          )[0]
        ];
      }
    } else if (t == 7) {
      // UNDEFINED BYTES
      if (length > 4) {
        pointer = struct.unpack(this.endianMark + "L", value)[0];
        data = this.tiftag.slice(pointer, pointer + length);
      } else {
        data = value.slice(0, length);
      }
    } else if (t == 10) {
      // SRATIONAL
      pointer = struct.unpack(this.endianMark + "L", value)[0];
      if (length > 1) {
        data = [];
        for (let x = 0; x < length; x++) {
          data.push([
            struct.unpack(
              this.endianMark + "l",
              this.tiftag.slice(pointer + x * 8, pointer + 4 + x * 8)
            )[0],
            struct.unpack(
              this.endianMark + "l",
              this.tiftag.slice(pointer + 4 + x * 8, pointer + 8 + x * 8)
            )[0]
          ]);
        }
      } else {
        data = [
          struct.unpack(
            this.endianMark + "l",
            this.tiftag.slice(pointer, pointer + 4)
          )[0],
          struct.unpack(
            this.endianMark + "l",
            this.tiftag.slice(pointer + 4, pointer + 8)
          )[0]
        ];
      }
    } else {
      throw new Error(
        "Exif might be wrong. Got incorrect value " +
          "type to decode. type:" +
          t
      );
    }

    if (data instanceof Array && data.length == 1) {
      return data[0];
    } else {
      return data;
    }
  };

  setEndianMark = (): void => {
    if (this.tiftag == null) {
      throw new Error("Given data doesn't have exif.");
    }
    if (this.tiftag.slice(0, 2) == "\x49\x49") {
      this.endianMark = "<";
    } else {
      this.endianMark = ">";
    }
  };
}
