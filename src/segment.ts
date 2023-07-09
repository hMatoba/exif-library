import * as struct from "./struct";

export const getThumbnail = (jpeg: string): string => {
  let segments = splitIntoSegments(jpeg);
  while (
    "\xff\xe0" <= segments[1].slice(0, 2) &&
    segments[1].slice(0, 2) <= "\xff\xef"
  ) {
    segments = [segments[0]].concat(segments.slice(2));
  }
  return segments.join("");
};

export const splitIntoSegments = (data: string): string[] => {
  if (data.slice(0, 2) != "\xff\xd8") {
    throw new Error("Given data isn't JPEG.");
  }

  let head = 2;
  const segments = ["\xff\xd8"];
  while (true) {
    if (data.slice(head, head + 2) == "\xff\xda") {
      segments.push(data.slice(head));
      break;
    } else {
      const length = struct.unpack(">H", data.slice(head + 2, head + 4))[0];
      const endPoint = head + length + 2;
      segments.push(data.slice(head, endPoint));
      head = endPoint;
    }

    if (head >= data.length) {
      throw new Error("Wrong JPEG data.");
    }
  }
  return segments;
};

export const getExifSeg = (segments: Array<string>): string => {
  let seg;
  for (let i = 0; i < segments.length; i++) {
    seg = segments[i];
    if (seg.slice(0, 2) == "\xff\xe1" && seg.slice(4, 10) == "Exif\x00\x00") {
      return seg;
    }
  }
  return null;
};

export const mergeSegments = (
  segments: Array<string>,
  exif: string,
): string => {
  let hasExifSegment = false;
  const additionalAPP1ExifSegments: Array<number> = [];

  segments.forEach(function (segment, i) {
    // Replace first occurence of APP1:Exif segment
    if (
      segment.slice(0, 2) == "\xff\xe1" &&
      segment.slice(4, 10) == "Exif\x00\x00"
    ) {
      if (!hasExifSegment) {
        segments[i] = exif;
        hasExifSegment = true;
      } else {
        additionalAPP1ExifSegments.unshift(i);
      }
    }
  });

  // Remove additional occurences of APP1:Exif segment
  additionalAPP1ExifSegments.forEach(function (segmentIndex) {
    segments.splice(segmentIndex, 1);
  });

  if (!hasExifSegment && exif) {
    segments = [segments[0], exif].concat(segments.slice(1));
  }

  return segments.join("");
};
