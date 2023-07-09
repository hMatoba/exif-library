import * as utils from "./utils";
import * as segment from "./segment";

export const remove = (imageBytes: string): string => {
  let bbase64Encoded = false;
  if (imageBytes.slice(0, 2) == "\xff\xd8") {
  } else if (
    imageBytes.slice(0, 23) == "data:image/jpeg;base64," ||
    imageBytes.slice(0, 22) == "data:image/jpg;base64,"
  ) {
    imageBytes = utils.atob(imageBytes.split(",")[1]);
    bbase64Encoded = true;
  } else {
    throw new Error("Given data is not jpeg.");
  }

  const segments = segment.splitIntoSegments(imageBytes);
  const newSegments = segments.filter(function (segment: string) {
    return !(
      segment.slice(0, 2) == "\xff\xe1" &&
      segment.slice(4, 10) == "Exif\x00\x00"
    );
  });

  let newBytes = newSegments.join("");
  if (bbase64Encoded) {
    newBytes = "data:image/jpeg;base64," + utils.btoa(newBytes);
  }

  return newBytes;
};
