// Vercel serverless function for image analysis
import { makeAnalysis } from '../_lib/analysis.js';

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
    const { text, sleepHours, stressLevel, imageBase64, facialEmotion } = req.body || {};
    // If image provided and no facialEmotion, simulate one
    let finalFacialEmotion = facialEmotion;
    if (imageBase64 && !facialEmotion) {
      const size = imageBase64 ? Buffer.byteLength(imageBase64, 'base64') : 0;
      const hash = size % 7;
      const emotions = ['happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted', 'neutral'];
      finalFacialEmotion = emotions[hash];
    }
    const result = makeAnalysis({ text, sleepHours, stressLevel, facialEmotion: finalFacialEmotion });
    
    setTimeout(() => {
      res.status(200).json(result);
    }, 300);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}