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
    
    // Simulate different emotions based on image characteristics
    const emotions = ['happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted', 'neutral'];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    // Map emotion to stress level
    const stressMap = {
      happy: 2,
      sad: 7,
      angry: 8,
      fearful: 9,
      surprised: 4,
      disgusted: 6,
      neutral: 5
    };
    
    const stressLevel = stressMap[emotion];
    
    setTimeout(() => {
      res.status(200).json({ emotion, stressLevel });
    }, 200);
  } catch (error) {
    res.status(400).json({ error: 'Invalid image data' });
  }
}