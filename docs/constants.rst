=========
Constants
=========

To set exif values
------------------

0th IFD and 1st IFD: *exifLib.TagNumbers.ImageIFD*

Exif IFD: *exifLib.TagNumbers.ExifIFD*

GPS IFD: *exifLib.TagNumbers.GPSIFD*

Interoperability IFD: *exifLib.TagNumbers.InteropIFD*

::

    let zerothIfd = {
        [exifLib.TagNumbers.ImageIFD.ProcessingSoftware]:'exif-library',
        [exifLib.TagNumbers.ImageIFD.XResolution]:[777, 1],
        [exifLib.TagNumbers.ImageIFD.YResolution]:[777, 1],
        [exifLib.TagNumbers.ImageIFD.Software]:"exif-library"
    };
    let exifIfd = {
        [exifLib.TagNumbers.ExifIFD.DateTimeOriginal]:"2010:10:10 10:10:10",
        [exifLib.TagNumbers.ExifIFD.LensMake]:"LensMake",
        [exifLib.TagNumbers.ExifIFD.Sharpness]:777,
        [exifLib.TagNumbers.ExifIFD.LensSpecification]:[[1, 1], [1, 1], [1, 1], [1, 1]]
    };
    let gpsIfd = {
        [exifLib.TagNumbers.GPSIFD.GPSVersionID]:[7, 7, 7, 7],
        [exifLib.TagNumbers.GPSIFD.GPSDateStamp]:"1999:99:99 99:99:99"
    };
    let exifObj = {"0th":zerothIfd, "Exif":exifIfd, "GPS":gpsIfd};


To read exif keys
-----------------

in *exifLib.Tags*

::

    let exifObj = exifLib.load(exifBinary);
    for (let ifd in exifObj) {
        if (ifd == "thumbnail") {
            continue;
        }
        console.log("-" + ifd);
        for (let tag in exifObj[ifd]) {
            console.log("  " + exifLib.Tags[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
        }
    }