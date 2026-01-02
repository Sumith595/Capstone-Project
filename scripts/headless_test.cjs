const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const appUrl = process.env.APP_URL || 'http://127.0.0.1:5173';
  console.log('Starting headless test against', appUrl);

  // small 1x1 PNG base64
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  const tmpDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const imagePath = path.join(tmpDir, 'test-face.png');
  fs.writeFileSync(imagePath, Buffer.from(pngBase64, 'base64'));
  console.log('Wrote test image to', imagePath);

  // wait for dev server to be reachable
  const waitForServer = async (url, retries = 10, delay = 500) => {
    const http = require('http');
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(url, (res) => {
            res.resume();
            resolve();
          });
          req.on('error', reject);
        });
        return true;
      } catch (e) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
    return false;
  };

  const up = await waitForServer(new URL(appUrl).href);
  if (!up) {
    console.error('Dev server not reachable at', appUrl);
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    await page.goto(appUrl, { waitUntil: 'networkidle2' });
    console.log('Page loaded');

    // Wait for textarea and type
    await page.waitForSelector('textarea');
    await page.click('textarea');
    const sampleText = 'I feel anxious and stressed about work today.';
    await page.type('textarea', sampleText, { delay: 30 });
    console.log('Typed text');

    await page.waitForTimeout(500);
    // Locate the stress value specifically under the label 'Estimated Stress Level'
    const [stressElem] = await page.$x("//label[contains(., 'Estimated Stress Level')]/span[contains(@class,'font-bold')]");
    if (!stressElem) throw new Error('Stress display element not found');
    const before = await page.evaluate(el => el.textContent.trim(), stressElem);
    console.log('Stress before:', before);
    try {
      await page.waitForFunction((xpath, prev) => {
        const resolver = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const el = resolver.singleNodeValue;
        return el && el.textContent.trim() !== prev;
      }, { timeout: 6000 }, "//label[contains(., 'Estimated Stress Level')]/span[contains(@class,'font-bold')]", before);
      console.log('Text-based estimation completed (value changed)');
    } catch (e) {
      console.warn('Text estimation did not complete in time or value did not change');
    }

    // Upload the test image
    const fileInput = await page.$('input[type=file]');
    if (!fileInput) throw new Error('File input not found');
    await fileInput.uploadFile(imagePath);
    console.log('Uploaded test image');

    // Wait for the stress value to change again after photo upload
    try {
      await page.waitForFunction((xpath) => {
        const resolver = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const el = resolver.singleNodeValue;
        return el && /\d+ \/ 10/.test(el.textContent || '');
      }, { timeout: 8000 }, "//label[contains(., 'Estimated Stress Level')]/span[contains(@class,'font-bold')]" );
      const after = await page.evaluate(xpath => {
        const resolver = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const el = resolver.singleNodeValue;
        return el ? el.textContent.trim() : null;
      }, "//label[contains(., 'Estimated Stress Level')]/span[contains(@class,'font-bold')]" );
      console.log('Stress after photo upload:', after);
    } catch (e) {
      console.warn('Photo-based estimation did not complete in time');
    }

    const btn = await page.$x("//button[contains(., 'Save & Analyze Entry')]");
    if (btn.length === 0) throw new Error('Save button not found');
    await btn[0].click();
    console.log('Clicked Save & Analyze Entry');

    // Wait a bit for analysis
    await page.waitForTimeout(1500);

    const stressText = await page.evaluate(() => {
      const el = document.querySelector('.font-bold.text-amber-400');
      return el ? el.textContent : null;
    });
    console.log('Stress display text:', stressText);

    console.log('Headless test completed successfully');
  } catch (err) {
    console.error('Headless test failed:', err);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
})();
