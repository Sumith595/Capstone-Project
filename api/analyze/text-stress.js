// Vercel serverless function for text stress analysis
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
    const { text } = req.body || {};
    const t = (text || '').toLowerCase();
    
    // Very simple heuristic: look for words indicating higher stress
    let score = 5;
    if (/panic|anxious|anxiety|overwhelmed|stressed|stress|worried|depressed|hopeless/.test(t)) score = 8;
    else if (/tired|exhausted|sleep deprived|sleep-deprived|fatigued/.test(t)) score = 6;
    else if (/calm|relaxed|happy|joy|good|great|excited/.test(t)) score = 2;
    
    // Slight modulation by length (long negative journal may indicate higher stress)
    const len = t.split(/\s+/).filter(Boolean).length;
    if (len > 50 && score >= 5) score = Math.min(10, score + 1);
    
    setTimeout(() => {
      res.status(200).json({ stressLevel: score });
    }, 150);
  } catch (error) {
    res.status(400).json({ error: 'Invalid text' });
  }
}