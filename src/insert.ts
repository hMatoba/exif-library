import * as utils from "./utils";
import * as struct from "./struct";
import * as segment from "./segment";

export const insert = (exifBytes: string, imageBytes: string): string => {
  let base64Encoded = false;
  if (exifBytes.slice(0, 6) != "\x45\x78\x69\x66\x00\x00") {
    throw new Error("Given data is not exif.");
  }
  if (imageBytes.slice(0, 2) == "\xff\xd8") {
  } else if (
    imageBytes.slice(0, 23) == "data:image/jpeg;base64," ||
    imageBytes.slice(0, 22) == "data:image/jpg;base64,"
  ) {
    imageBytes = utils.atob(imageBytes.split(",")[1]);
    base64Encoded = true;
  } else {
    throw new Error("Given data is not jpeg.");
  }

  const app1Segment =
    "\xff\xe1" + struct.pack(">H", [exifBytes.length + 2]) + exifBytes;
  const segments = segment.splitIntoSegments(imageBytes);
  let newBytes = segment.mergeSegments(segments, app1Segment);
  if (base64Encoded) {
    newBytes = "data:image/jpeg;base64," + utils.btoa(newBytes);
  }

  return newBytes;
};
