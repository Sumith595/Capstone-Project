// Vercel serverless function for facial analysis
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { imageBase64 } = req.body || {};
    
    // Simple mock heuristic: derive a pseudo-random but deterministic stress level from image size
    const size = imageBase64 ? Buffer.byteLength(imageBase64, 'base64') : 0;
    // Map size into 1-10 range deterministically
    const stressLevel = Math.max(1, Math.min(10, 1 + (size % 10)));
    
    setTimeout(() => {
      res.status(200).json({ stressLevel });
    }, 200);
  } catch (error) {
    res.status(400).json({ error: 'Invalid image data' });
  }
}