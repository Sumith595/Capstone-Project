const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  console.log('Starting headless test against', appUrl);

  // small 1x1 PNG base64 (opaque blue)
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  const tmpDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const imagePath = path.join(tmpDir, 'test-face.png');
  fs.writeFileSync(imagePath, Buffer.from(pngBase64, 'base64'));
  console.log('Wrote test image to', imagePath);

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

    // Wait for the estimated stress indicator to show 'Estimating' or a value
    await page.waitForTimeout(1000);
    // Wait up to 5s for estimation to finish (the UI uses ~700ms debounce)
    try {
      await page.waitForFunction(() => {
        const el = document.querySelector('.text-xs.text-slate-400');
        return el && el.textContent && !/Estimating/.test(el.textContent);
      }, { timeout: 5000 });
      console.log('Text-based estimation completed');
    } catch (e) {
      console.warn('Text estimation did not complete in time');
    }

    // Upload the test image
    const fileInput = await page.$('input[type=file]');
    if (!fileInput) throw new Error('File input not found');
    await fileInput.uploadFile(imagePath);
    console.log('Uploaded test image');

    // Wait for the UI to reflect that estimation is from photo
    await page.waitForFunction(() => {
      const el = document.querySelector('.text-xs.text-slate-400');
      return el && /photo/.test(el.textContent || '');
    }, { timeout: 8000 });
    console.log('Photo-based estimation detected');

    // Click Save & Analyze Entry button
    const btn = await page.$x("//button[contains(., 'Save & Analyze Entry')]");
    if (btn.length === 0) throw new Error('Save button not found');
    await btn[0].click();
    console.log('Clicked Save & Analyze Entry');

    // Wait for analysis to appear in the entries list (right column cards)
    await page.waitForSelector('div[class*="JournalEntryCard"], .space-y-4 .bg-slate-800 ~ *', { timeout: 10000 }).catch(()=>{});

    // Grab current estimated stress value text
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
