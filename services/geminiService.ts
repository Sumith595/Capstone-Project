import { AIAnalysisResult } from "../types";

/*
  Client-only Gemini service
  - Forwards requests to a backend API defined by `VITE_API_BASE_URL`.
  - Must NOT import server-only modules so Vite can bundle the client.
*/

export interface WellnessParams {
  text: string;
  sleepHours: number;
  stressLevel: number;
}

export const analyzeWellness = async (
  params: WellnessParams & { imageBase64: string; imageMimeType: string }
): Promise<AIAnalysisResult> => {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const res = await fetch(`${base}/api/analyze/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analysis API error: ${text}`);
  }
  return (await res.json()) as AIAnalysisResult;
};

export const analyzeWellnessTextOnly = async (params: WellnessParams): Promise<AIAnalysisResult> => {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const res = await fetch(`${base}/api/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analysis API error: ${text}`);
  }
  return (await res.json()) as AIAnalysisResult;
};

// Sends only the image to the backend to get an estimated stress level (1-10).
export const analyzeStressFromImage = async (
  params: { imageBase64: string; imageMimeType: string }
): Promise<number> => {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const res = await fetch(`${base}/api/analyze/facial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Facial analysis API error: ${text}`);
  }
  const payload = await res.json();
  // Expect { stressLevel: number }
  return Number(payload?.stressLevel) || 5;
};

// Sends text to the backend to get an estimated stress level (1-10) derived from text analysis.
export const analyzeStressFromText = async (
  params: { text: string }
): Promise<number> => {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const res = await fetch(`${base}/api/analyze/text-stress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Text stress analysis API error: ${text}`);
  }
  const payload = await res.json();
  return Number(payload?.stressLevel) || 5;
};
