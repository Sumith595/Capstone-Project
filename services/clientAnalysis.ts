import { AIAnalysisResult } from "../types";

export interface WellnessParams {
  text: string;
  sleepHours: number;
  stressLevel: number;
  facialEmotion?: string;
}

export function makeAnalysisClient({ text, sleepHours = 7, stressLevel = 5 }: WellnessParams): AIAnalysisResult {
  // Normalize inputs
  const normalizedSleep = Math.max(0, Math.min(12, Number(sleepHours) || 7));
  const normalizedStress = Math.max(0, Math.min(10, Number(stressLevel) || 5));
  const textLower = (text || '').toLowerCase();
  const hasText = text && typeof text === 'string' && text.trim().length > 0;

  console.log('=== Client Analysis called ===');
  console.log('Text:', text);
  console.log('Sleep Hours:', normalizedSleep);
  console.log('Stress Level:', normalizedStress);
  console.log('Has Text:', hasText);

  // Analyze text for emotional indicators
  const emotionalIndicators = {
    anxiety: /anxious|anxiety|panic|worried|nervous|fear|scared|overwhelmed|restless/i.test(textLower),
    depression: /depressed|sad|hopeless|empty|worthless|lonely|down|blue|miserable/i.test(textLower),
    anger: /angry|mad|furious|irritated|frustrated|rage|annoyed|pissed/i.test(textLower),
    stress: /stressed|pressure|burden|exhausted|tired|overworked|deadline/i.test(textLower),
    happiness: /happy|joy|excited|great|amazing|wonderful|fantastic|good|positive|cheerful/i.test(textLower),
    calm: /calm|peaceful|relaxed|serene|tranquil|content|balanced/i.test(textLower),
    grief: /grief|loss|mourning|miss|died|death|goodbye|funeral/i.test(textLower),
    confusion: /confused|lost|uncertain|don't know|unclear|mixed up/i.test(textLower),
    motivation: /motivated|determined|focused|goal|achieve|success|progress/i.test(textLower),
    fatigue: /tired|exhausted|drained|sleepy|weary|worn out/i.test(textLower)
  };

  // Determine primary emotion and mood score
  let primaryEmotion = 'neutral';
  let moodScore = 5;
  const keyEmotions: string[] = [];

  // If no text provided, infer emotion primarily from stress level and sleep
  if (!hasText) {
    console.log('Using stress-based analysis (no text)');
    if (normalizedStress >= 8) {
      primaryEmotion = 'anxious';
      moodScore = Math.max(1, 4 - (normalizedStress / 2));
      keyEmotions.push('anxious', 'stressed');
    } else if (normalizedStress >= 6) {
      primaryEmotion = 'stressed';
      moodScore = Math.max(2, 6 - normalizedStress);
      keyEmotions.push('stressed', 'tense');
    } else if (normalizedStress <= 2 && normalizedSleep >= 7) {
      primaryEmotion = 'calm';
      moodScore = Math.min(9, 7 + (normalizedSleep / 3) - (normalizedStress / 4));
      keyEmotions.push('calm', 'peaceful');
    } else if (normalizedSleep < 5) {
      primaryEmotion = 'tired';
      moodScore = Math.max(2, 6 - (12 - normalizedSleep));
      keyEmotions.push('tired', 'exhausted');
    } else if (normalizedStress <= 3) {
      primaryEmotion = 'happy';
      moodScore = Math.max(7, 10 - normalizedStress + (normalizedSleep / 2));
      keyEmotions.push('happy', 'content');
    } else {
      // Moderate stress, decent sleep
      moodScore = Math.round(5 + (normalizedSleep / 3) - (normalizedStress / 2));
      keyEmotions.push('neutral');
    }
  } else {
    console.log('Using text-based analysis');
    // Text-based analysis
    if (emotionalIndicators.happiness) {
      primaryEmotion = 'happy';
      moodScore = Math.max(7, 10 - normalizedStress + (normalizedSleep / 2));
      keyEmotions.push('happy', 'positive');
    } else if (emotionalIndicators.anxiety) {
      primaryEmotion = 'anxious';
      moodScore = Math.max(1, 4 - (normalizedStress / 2));
      keyEmotions.push('anxious', 'worried');
    } else if (emotionalIndicators.depression) {
      primaryEmotion = 'depressed';
      moodScore = Math.max(1, 3 - (normalizedStress / 3));
      keyEmotions.push('sad', 'down');
    } else if (emotionalIndicators.anger) {
      primaryEmotion = 'angry';
      moodScore = Math.max(2, 5 - (normalizedStress / 2));
      keyEmotions.push('angry', 'frustrated');
    } else if (emotionalIndicators.stress) {
      primaryEmotion = 'stressed';
      moodScore = Math.max(2, 6 - normalizedStress);
      keyEmotions.push('stressed', 'overwhelmed');
    } else if (emotionalIndicators.calm) {
      primaryEmotion = 'calm';
      moodScore = Math.min(9, 7 + (normalizedSleep / 3) - (normalizedStress / 4));
      keyEmotions.push('calm', 'peaceful');
    } else if (emotionalIndicators.grief) {
      primaryEmotion = 'grieving';
      moodScore = Math.max(1, 4 - (normalizedStress / 3));
      keyEmotions.push('grieving', 'sad');
    } else if (emotionalIndicators.confusion) {
      primaryEmotion = 'confused';
      moodScore = Math.max(3, 5 - (normalizedStress / 3));
      keyEmotions.push('confused', 'uncertain');
    } else if (emotionalIndicators.fatigue) {
      primaryEmotion = 'tired';
      moodScore = Math.max(2, 6 - (12 - normalizedSleep));
      keyEmotions.push('tired', 'exhausted');
    } else {
      // Default neutral state
      moodScore = Math.round(5 + (normalizedSleep / 3) - (normalizedStress / 2));
      keyEmotions.push('neutral');
    }
  }

  moodScore = Math.max(1, Math.min(10, Math.round(moodScore)));

  // Determine overall mood category
  const overallMood = moodScore >= 8 ? 'very positive' :
                     moodScore >= 6 ? 'positive' :
                     moodScore >= 4 ? 'neutral' :
                     moodScore >= 2 ? 'negative' : 'very negative';

  // Generate personalized feedback
  const feedbackMap: Record<string, string> = {
    happy: `You're radiating positivity! Your happiness is wonderful to see. Keep nurturing this positive energy while maintaining balance in your life.`,
    anxious: `I understand you're feeling anxious right now. Remember that anxiety is temporary and manageable. Focus on grounding techniques and take things one step at a time.`,
    depressed: `I hear that you're going through a difficult time. Your feelings are valid, and it's okay to not be okay. Consider reaching out for support and be gentle with yourself.`,
    angry: `Your anger is a valid emotion that's telling you something important. Try to identify what's underneath the anger and find healthy ways to express and process these feelings.`,
    stressed: `Stress can feel overwhelming, but you have the strength to manage it. Break down your challenges into smaller, manageable pieces and prioritize self-care.`,
    calm: `Your sense of calm is beautiful and grounding. This peaceful state is a great foundation for clarity and well-being. Enjoy this moment of tranquility.`,
    grieving: `Grief is a natural response to loss, and healing takes time. Allow yourself to feel and process these emotions. Consider seeking support from loved ones or professionals.`,
    confused: `Feeling uncertain is part of the human experience. It's okay not to have all the answers right now. Take time to reflect and trust that clarity will come.`,
    tired: `Your body and mind are telling you they need rest. Prioritize sleep and recovery. Remember that rest is productive and necessary for your well-being.`,
    neutral: `You seem to be in a balanced state today. This is a good foundation to build upon. Consider what small steps might enhance your well-being.`
  };

  // Generate activity suggestions
  const activityMap: Record<string, string[]> = {
    happy: [
      'Share your joy with someone you care about',
      'Try a creative activity like drawing, writing, or dancing',
      'Go for an energizing walk or light exercise',
      'Practice gratitude by writing down three things you appreciate'
    ],
    anxious: [
      'Practice the 4-7-8 breathing technique (inhale 4, hold 7, exhale 8)',
      'Try progressive muscle relaxation',
      'Ground yourself using the 5-4-3-2-1 technique (5 things you see, 4 you hear, etc.)',
      'Take a warm bath or shower to relax your body'
    ],
    depressed: [
      'Take a gentle walk outside, even if just for 5 minutes',
      'Reach out to a trusted friend or family member',
      'Do one small, manageable task to create a sense of accomplishment',
      'Practice self-compassion with kind self-talk'
    ],
    angry: [
      'Try vigorous exercise like running, boxing, or intense walking',
      'Write down your feelings in a journal without censoring',
      'Practice deep breathing or count to 10 before reacting',
      'Channel your energy into cleaning or organizing'
    ],
    stressed: [
      'Practice mindfulness meditation for 5-10 minutes',
      'Make a priority list and tackle one item at a time',
      'Take regular breaks every hour to stretch and breathe',
      'Try the "brain dump" technique - write down all your worries'
    ],
    calm: [
      'Enjoy a mindful tea or coffee break',
      'Read a book or listen to a podcast',
      'Practice gentle yoga or stretching',
      'Spend time in nature or by a window'
    ],
    grieving: [
      'Allow yourself time to grieve and process your emotions',
      'Reach out to supportive friends or family',
      'Consider joining a support group or speaking with a counselor',
      'Create a small ritual to honor your loss'
    ],
    confused: [
      'Take time to journal your thoughts and feelings',
      'Talk through your confusion with a trusted friend',
      'Break down complex issues into smaller, manageable parts',
      'Practice mindfulness to stay present and reduce anxiety'
    ],
    tired: [
      'Take a short nap or rest break',
      'Practice gentle stretching or yoga',
      'Ensure you have a consistent sleep schedule',
      'Limit caffeine and screen time before bed'
    ],
    neutral: [
      'Try a new hobby or activity you\'ve been curious about',
      'Connect with friends or family for social support',
      'Set small, achievable goals for the day',
      'Practice mindfulness or meditation'
    ]
  };

  // Generate music recommendations
  const musicMap: Record<string, string[]> = {
    happy: [
      '"Happy" by Pharrell Williams',
      '"Can\'t Stop the Feeling!" by Justin Timberlake',
      '"Uptown Funk" by Mark Ronson ft. Bruno Mars',
      '"Walking on Sunshine" by Katrina and the Waves'
    ],
    anxious: [
      '"Weightless" by Marconi Union',
      '"River Flows in You" by Yiruma',
      '"The Journey" by 911 Band',
      '"Breathe Me" by Sia'
    ],
    depressed: [
      '"The Sound of Silence" by Simon & Garfunkel',
      '"Hurt" by Johnny Cash',
      '"Everybody Hurts" by R.E.M.',
      '"Tears in Heaven" by Eric Clapton'
    ],
    angry: [
      '"Break Stuff" by Limp Bizkit',
      '"Killing in the Name" by Rage Against the Machine',
      '"You Give Love a Bad Name" by Bon Jovi',
      '"Back in Black" by AC/DC'
    ],
    stressed: [
      '"Stress Relief" by Liquid Mind',
      '"The Köln Concert" by Keith Jarrett',
      '"Music for Airports" by Brian Eno',
      '"Weightless (Remix)" by Marconi Union'
    ],
    calm: [
      '"Gymnopédie No. 1" by Erik Satie',
      '"Comptine d\'un autre été" by Yann Tiersen',
      '"The Piano Guys" selections',
      '"Moonlight Sonata" by Beethoven'
    ],
    grieving: [
      '"Hallelujah" by Leonard Cohen',
      '"Tears in Heaven" by Eric Clapton',
      '"My Heart Will Go On" by Celine Dion',
      '"Supermarket Flowers" by Ed Sheeran'
    ],
    confused: [
      '"Imagine" by John Lennon',
      '"What a Wonderful World" by Louis Armstrong',
      '"The Times They Are A-Changin\'" by Bob Dylan',
      '"Blackbird" by The Beatles'
    ],
    tired: [
      '"Goodnight Moon" by Shivaree',
      '"Lullaby" by Dixie Chicks',
      '"Brahms\' Lullaby" by Johannes Brahms',
      '"Dream On" by Aerosmith'
    ],
    neutral: [
      '"Three Little Birds" by Bob Marley',
      '"Don\'t Worry, Be Happy" by Bobby McFerrin',
      '"Here Comes the Sun" by The Beatles',
      '"Lean on Me" by Bill Withers'
    ]
  };

  const feedback = feedbackMap[primaryEmotion] || feedbackMap.neutral;
  const activities = activityMap[primaryEmotion] || activityMap.neutral;
  const musicRecommendations = musicMap[primaryEmotion] || musicMap.neutral;

  const activitySuggestion = activities[Math.floor(Math.random() * activities.length)];
  const musicSuggestion = musicRecommendations[Math.floor(Math.random() * musicRecommendations.length)];

  console.log('Client Analysis Result - Emotion:', primaryEmotion, 'Score:', moodScore, 'Overall Mood:', overallMood);

  return {
    overallMood,
    moodScore,
    keyEmotions,
    feedback,
    activitySuggestion,
    musicRecommendation: musicSuggestion,
    primaryEmotion
  };
}

export function analyzeStressFromTextClient(text: string): number {
  const t = (text || '').toLowerCase();
  let score = 5;
  if (/panic|terrified|overwhelmed|can't cope/i.test(t)) score = 9;
  else if (/very stressed|high pressure|burnt out/i.test(t)) score = 8;
  else if (/stressed|anxious|worried|nervous/i.test(t)) score = 7;
  else if (/some stress|mild anxiety|tense/i.test(t)) score = 6;
  else if (/tired|exhausted|fatigued/i.test(t)) score = 6;
  else if (/calm|relaxed|happy|joy|good/i.test(t)) score = 4;
  else if (/peaceful|serene|content/i.test(t)) score = 3;
  return score;
}