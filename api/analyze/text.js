// Vercel serverless function for text analysis
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
    const { text, sleepHours, stressLevel } = req.body || {};
    const result = makeAnalysis({ text, sleepHours, stressLevel });
    
    // Simulate processing delay
    setTimeout(() => {
      res.status(200).json(result);
    }, 250);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}