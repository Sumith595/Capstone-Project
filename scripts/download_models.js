const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'models');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const base = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
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
    const url = `${base}/${f}`;
    const dest = path.join(targetDir, f);
    try {
      await downloadFile(url, dest);
      console.log('Saved:', dest);
    } catch (err) {
      console.error('Failed to download', url, err.message || err);
    }
  }
  console.log('Done.');
})();
