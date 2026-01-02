const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'models');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const cdnGhBase = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
const cdnNpmBase = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
const rawBase = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1.bin',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1.bin',
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request Failed. Status Code: ${res.statusCode} for ${url}`));
          res.resume();
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

(async () => {
  console.log('Downloading face-api.js models to', targetDir);
  for (const f of files) {
      const dest = path.join(targetDir, f);
      const candidates = [
        `${cdnNpmBase}/${f}`,
        `${cdnGhBase}/${f}`,
        `${rawBase}/${f}`,
      ];
      let saved = false;
      for (const url of candidates) {
        try {
          await downloadFile(url, dest);
          console.log('Saved:', dest, 'from', url);
          saved = true;
          break;
        } catch (err) {
          console.warn('Failed to download', url, err.message || err);
        }
      }
      if (!saved) {
        console.error('All attempts failed for', f);
      }
  }
  console.log('Done.');
})();
