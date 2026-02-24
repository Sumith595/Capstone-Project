import { AIAnalysisResult } from "../types";
import { makeAnalysisClient, analyzeStressFromTextClient } from "./clientAnalysis";

/*
  Client-side analysis service
  - Uses local analysis functions for instant responses
  - No network calls for better performance
*/

export interface WellnessParams {
  text: string;
  sleepHours: number;
  stressLevel: number;
  facialEmotion?: string;
}

export const analyzeWellness = async (
  params: WellnessParams & { imageBase64: string; imageMimeType: string }
): Promise<AIAnalysisResult> => {
  // For image analysis, simulate facial emotion detection
  const facialStressLevel = Math.floor(Math.random() * 10) + 1;
  const facialEmotions = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful'];
  const detectedEmotion = facialEmotions[Math.floor(Math.random() * facialEmotions.length)];

  return makeAnalysisClient({
    ...params,
    stressLevel: Math.max(params.stressLevel, facialStressLevel),
    facialEmotion: detectedEmotion
  });
};

export const analyzeWellnessTextOnly = async (params: WellnessParams): Promise<AIAnalysisResult> => {
  return makeAnalysisClient(params);
};

// Simulate facial analysis with random but reasonable results
export const analyzeStressFromImage = async (
  params: { imageBase64: string; imageMimeType: string }
): Promise<{ stressLevel: number; emotion?: string }> => {
  // Simulate processing time (very short)
  await new Promise(resolve => setTimeout(resolve, 10));

  const stressLevel = Math.floor(Math.random() * 10) + 1;
  const emotions = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful', 'disgusted'];
  const emotion = emotions[Math.floor(Math.random() * emotions.length)];

  return { stressLevel, emotion };
};

// Use client-side text stress analysis
export const analyzeStressFromText = async (
  params: { text: string }
): Promise<number> => {
  return analyzeStressFromTextClient(params.text);
};
