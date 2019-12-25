const fs = require('fs');
const exifLib = require('../../dist/exif-library');

const timeout = 5000;
const jpegBinary = fs.readFileSync("./tests/files/r_canon.jpg").toString("binary");
const exifLibPath = '../../dist/exif-library.js';

let page;
beforeAll(async () => {
  page = await global.__BROWSER__.newPage()
}, timeout);

afterAll(async () => {
  await page.close()
});

it('test to check running puppeteer', async () => {
  await page.addScriptTag({
    content: "const x = 1 + 1;"
  });
});

it('should be same output from load on node and browser ', async () => {
  const nodeOutput = exifLib.load(jpegBinary);
  await page.addScriptTag({
    path: require.resolve(exifLibPath)
  });
  
  const browserOutput = await page.evaluate((jpeg) => {
      return exifLib.load(jpeg);
    },
    jpegBinary
  );
  expect(browserOutput).toEqual(nodeOutput);
});

it('should be same output from dump on node and browser ', async () => {
  const exif = {
    '0th': {
      '256': 10,
      '257': 10
    }
  };
  const nodeOutput = exifLib.dump(exif);
  await page.addScriptTag({
    path: require.resolve(exifLibPath)
  });
  const browserOutput = await page.evaluate((exifObj) => {
      return exifLib.dump(exifObj);
    },
    exif
  );
  expect(browserOutput).toEqual(nodeOutput);
});

it('should be same output from insert on node and browser ', async () => {
  const exif = {
    '0th': {
      '256': 10,
      '257': 10
    }
  };
  const exifBinary = exifLib.dump(exif);
  const nodeOutput = exifLib.insert(exifBinary, jpegBinary);;
  await page.addScriptTag({
    path: require.resolve(exifLibPath)
  });
  const browserOutput = await page.evaluate((exif, jpeg) => {
      return exifLib.insert(exif, jpeg);
    },
    exifBinary,
    jpegBinary
  );
  expect(browserOutput).toEqual(nodeOutput);
});

it('should be same output from remove on node and browser ', async () => {
  const nodeOutput = exifLib.remove(jpegBinary);
  await page.addScriptTag({
    path: require.resolve(exifLibPath)
  });
  const browserOutput = await page.evaluate((jpeg) => {
      return exifLib.remove(jpeg);
    },
    jpegBinary
  );
  expect(browserOutput).toEqual(nodeOutput);
});
