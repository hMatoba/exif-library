=========
Functions
=========

.. warning:: It could set any value in exif without actual value. For example, actual XResolution is 300, whereas XResolution value in exif is 0. Confliction might happen.
.. warning:: To edit exif tags and values appropriately, read official document from P167-. http://www.cipa.jp/std/documents/e/DC-008-2012_E.pdf


load
----

.. js:function:: exifLib.load(jpegData)

   Get exif data as *object*. jpegData must be a *string* that starts with "\data:image/jpeg;base64,"(DataURL), "\\xff\\xd8", or "Exif".

   :param string jpegData: JPEG data
   :return: Exif data({"0th":object, "Exif":object, "GPS":object, "Interop":object, "1st":object, "thumbnail":string})
   :rtype: object

::

    let exifObj = exifLib.load(jpegData);
    for (let ifd in exifObj) {
        if (ifd == "thumbnail") {
            continue;
        }
        console.log("-" + ifd);
        for (let tag in exifObj[ifd]) {
            console.log("  " + exifLib.Tags[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
        }
    }

dump
----

.. js:function:: exifLib.dump(exifObj)

   Get exif binary as *string* to insert into JPEG.

   :param object exifObj: Exif data({"0th":0thIFD - object, "Exif":ExifIFD - object, "GPS":GPSIFD - object, "Interop":InteroperabilityIFD - object, "1st":1stIFD - object, "thumbnail":JPEG data - string})
   :return: Exif binary
   :rtype: string

::

    let zeroth = {};
    let exif = {};
    let gps = {};
    zeroth[exifLib.TagNumbers.ImageIFD.Make] = "Make";
    zeroth[exifLib.TagNumbers.ImageIFD.XResolution] = [777, 1];
    zeroth[exifLib.TagNumbers.ImageIFD.YResolution] = [777, 1];
    zeroth[exifLib.TagNumbers.ImageIFD.Software] = "exif-library";
    exif[exifLib.TagNumbers.ExifIFD.DateTimeOriginal] = "2010:10:10 10:10:10";
    exif[exifLib.TagNumbers.ExifIFD.LensMake] = "LensMake";
    exif[exifLib.TagNumbers.ExifIFD.Sharpness] = 777;
    exif[exifLib.TagNumbers.ExifIFD.LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]];
    gps[exifLib.TagNumbers.GPSIFD.GPSVersionID] = [7, 7, 7, 7];
    gps[exifLib.TagNumbers.GPSIFD.GPSDateStamp] = "1999:99:99 99:99:99";
    let exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps};
    const exifbytes = exifLib.dump(exifObj);

Properties of *exifLib.TagNumbers.ImageIFD* help to make 0thIFD and 1stIFD. *exifLib.TagNumbers.ExifIFD* is for ExifIFD. *exifLib.TagNumbers.GPSIFD* is for GPSIFD. *exifLib.InteropIFD* is for InteroperabilityIFD.

.. note:: ExifTag(34665), GPSTag(34853), and InteroperabilityTag(40965) in 0thIFD automatically are set appropriate value.
.. note:: JPEGInterchangeFormat(513), and JPEGInterchangeFormatLength(514) in 1stIFD automatically are set appropriate value.
.. note:: If 'thumbnail' is contained in *exifObj*, '1st' must be contained -- and vice versa. 1stIFD means thumbnail's information.

insert
------
.. js:function:: exifLib.insert(exifbytes, jpegData)

   Insert exif into JPEG.

   :param string exifbytes: Exif binary
   :param string jpegData: JPEG data
   :return: JPEG data
   :rtype: string

::

    const exifbytes = exifLib.dump(exifObj)
    const newJpeg = exifLib.insert(exifbytes, jpegData)

remove
------
.. js:function:: exifLib.remove(jpegData)

   Remove exif from JPEG.

   :param string jpegData: JPEG data
   :return: JPEG data
   :rtype: string

::

    const newJpeg = exifLib.remove(jpegData)
