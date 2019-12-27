=========
Constants
=========

To set exif values
------------------

0th IFD and 1st IFD: *piexif.TagNumbers.ImageIFD*

Exif IFD: *piexif.TagNumbers.ExifIFD*

GPS IFD: *piexif.TagNumbers.GPSIFD*

Interoperability IFD: *piexif.TagNumbers.InteropIFD*

::

    let zerothIfd = {
        [piexif.TagNumbers.ImageIFD.ProcessingSoftware]:'piexifjs',
        [piexif.TagNumbers.ImageIFD.XResolution]:[777, 1],
        [piexif.TagNumbers.ImageIFD.YResolution]:[777, 1],
        [piexif.TagNumbers.ImageIFD.Software]:"Piexifjs"
    };
    let exifIfd = {
        [piexif.TagNumbers.ExifIFD.DateTimeOriginal]:"2010:10:10 10:10:10",
        [piexif.TagNumbers.ExifIFD.LensMake]:"LensMake",
        [piexif.TagNumbers.ExifIFD.Sharpness]:777,
        [piexif.TagNumbers.ExifIFD.LensSpecification]:[[1, 1], [1, 1], [1, 1], [1, 1]]
    };
    let gpsIfd = {
        [piexif.TagNumbers.GPSIFD.GPSVersionID]:[7, 7, 7, 7],
        [piexif.TagNumbers.GPSIFD.GPSDateStamp]:"1999:99:99 99:99:99"
    };
    let exifObj = {"0th":zerothIfd, "Exif":exifIfd, "GPS":gpsIfd};


To read exif keys
-----------------

in *piexif.Tags*

::

    let exifObj = piexif.load(exifBinary);
    for (let ifd in exifObj) {
        if (ifd == "thumbnail") {
            continue;
        }
        console.log("-" + ifd);
        for (let tag in exifObj[ifd]) {
            console.log("  " + piexif.Tags[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
        }
    }