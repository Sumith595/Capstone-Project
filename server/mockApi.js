import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function makeAnalysis({ text, sleepHours = 7, stressLevel = 5 }) {
  // Normalize inputs
  const normalizedSleep = Math.max(0, Math.min(12, Number(sleepHours) || 7));
  const normalizedStress = Math.max(0, Math.min(10, Number(stressLevel) || 5));
  const textLower = (text || '').toLowerCase();

  // Analyze text for emotional indicators
  const emotionalIndicators = {
    anxiety: /anxious|anxiety|panic|worried|nervous|fear|scared|overwhelmed|restless/i.test(text),
    depression: /depressed|sad|hopeless|empty|worthless|lonely|down|blue|miserable/i.test(text),
    anger: /angry|mad|furious|irritated|frustrated|rage|annoyed|pissed/i.test(text),
    stress: /stressed|pressure|burden|exhausted|tired|overworked|deadline/i.test(text),
    happiness: /happy|joy|excited|great|amazing|wonderful|fantastic|good|positive|cheerful/i.test(text),
    calm: /calm|peaceful|relaxed|serene|tranquil|content|balanced/i.test(text),
    grief: /grief|loss|mourning|miss|died|death|goodbye|funeral/i.test(text),
    confusion: /confused|lost|uncertain|don't know|unclear|mixed up/i.test(text),
    motivation: /motivated|determined|focused|goal|achieve|success|progress/i.test(text),
    fatigue: /tired|exhausted|drained|sleepy|weary|worn out/i.test(text)
  };

  // Determine primary emotion and mood score
  let primaryEmotion = 'neutral';
  let moodScore = 5;
  const keyEmotions = [];

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

  moodScore = Math.max(1, Math.min(10, Math.round(moodScore)));

  // Determine overall mood category
  const overallMood = moodScore >= 8 ? 'very positive' : 
                     moodScore >= 6 ? 'positive' : 
                     moodScore >= 4 ? 'neutral' : 
                     moodScore >= 2 ? 'negative' : 'very negative';

  // Generate personalized feedback based on primary emotion
  const feedbackMap = {
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

  // Generate personalized activity suggestions
  const activityMap = {
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
      'Allow yourself to cry if you need to',
      'Look through photos or mementos that bring comfort',
      'Write a letter to your loved one or journal about your feelings',
      'Reach out to a grief counselor or support group'
    ],
    confused: [
      'Write down your thoughts to help organize them',
      'Talk through your situation with a trusted friend',
      'Take a break from decision-making if possible',
      'Try meditation to quiet mental chatter'
    ],
    tired: [
      'Take a 20-30 minute power nap if possible',
      'Go to bed 30 minutes earlier tonight',
      'Avoid caffeine and screens before bedtime',
      'Try gentle stretching or restorative yoga'
    ],
    neutral: [
      'Set a small, achievable goal for today',
      'Try something new or learn a new skill',
      'Connect with a friend or family member',
      'Practice mindfulness or meditation'
    ]
  };

  // Generate music recommendations based on emotion
  const musicMap = {
    happy: [
      '"Happy" by Pharrell Williams',
      '"Good Vibrations" by The Beach Boys',
      '"Walking on Sunshine" by Katrina and the Waves',
      '"Can\'t Stop the Feeling" by Justin Timberlake',
      '"Uptown Funk" by Mark Ronson ft. Bruno Mars'
    ],
    anxious: [
      '"Weightless" by Marconi Union',
      '"Clair de Lune" by Claude Debussy',
      '"Aqueous Transmission" by Incubus',
      '"Mad World" by Gary Jules (for processing)',
      '"Breathe Me" by Sia (for understanding)'
    ],
    depressed: [
      '"The Sound of Silence" by Simon & Garfunkel',
      '"Hurt" by Johnny Cash',
      '"Black" by Pearl Jam',
      '"Everybody Hurts" by R.E.M.',
      '"Skinny Love" by Bon Iver'
    ],
    angry: [
      '"Break Stuff" by Limp Bizkit',
      '"Killing in the Name" by Rage Against the Machine',
      '"Bodies" by Drowning Pool',
      '"Chop Suey!" by System of a Down',
      '"Last Resort" by Papa Roach'
    ],
    stressed: [
      '"Stress Relief" by Liquid Mind',
      '"River" by Joni Mitchell',
      '"The Night We Met" by Lord Huron',
      '"Holocene" by Bon Iver',
      '"Mad About You" by Sting'
    ],
    calm: [
      '"Gymnopédie No. 1" by Erik Satie',
      '"Spiegel im Spiegel" by Arvo Pärt',
      '"On Earth as It Is in Heaven" by Ólafur Arnalds',
      '"Nuvole Bianche" by Ludovico Einaudi',
      '"Porcelain" by Moby'
    ],
    grieving: [
      '"Tears in Heaven" by Eric Clapton',
      '"Hallelujah" by Jeff Buckley',
      '"The Dance" by Garth Brooks',
      '"See You Again" by Wiz Khalifa ft. Charlie Puth',
      '"My Heart Will Go On" by Celine Dion'
    ],
    confused: [
      '"Losing My Religion" by R.E.M.',
      '"Creep" by Radiohead',
      '"Everybody\'s Free (To Wear Sunscreen)" by Baz Luhrmann',
      '"The Middle" by Jimmy Eat World',
      '"Unwell" by Matchbox Twenty'
    ],
    tired: [
      '"Sleepyhead" by Passion Pit',
      '"I\'m Tired" by Labrinth & Zendaya',
      '"Tired" by Stone Sour',
      '"So Tired" by Ozzy Osbourne',
      '"Exhausted" by Foo Fighters'
    ],
    neutral: [
      '"Three Little Birds" by Bob Marley',
      '"Here Comes the Sun" by The Beatles',
      '"Good Day Sunshine" by The Beatles',
      '"Lovely Day" by Bill Withers',
      '"What a Wonderful World" by Louis Armstrong'
    ]
  };

  const feedback = feedbackMap[primaryEmotion] || feedbackMap.neutral;
  const activities = activityMap[primaryEmotion] || activityMap.neutral;
  const musicRecommendations = musicMap[primaryEmotion] || musicMap.neutral;
  
  // Select random activity and music recommendation
  const activitySuggestion = activities[Math.floor(Math.random() * activities.length)];
  const musicSuggestion = musicRecommendations[Math.floor(Math.random() * musicRecommendations.length)];

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

app.post('/api/analyze/text', (req, res) => {
  const { text, sleepHours, stressLevel } = req.body || {};
  const result = makeAnalysis({ text, sleepHours, stressLevel });
  // slight delay to simulate processing
  setTimeout(() => res.json(result), 250);
});

app.post('/api/analyze/image', (req, res) => {
  const { text, sleepHours, stressLevel, imageBase64 } = req.body || {};
  // We ignore image content in this mock; in a real backend you'd analyze it.
  const result = makeAnalysis({ text, sleepHours, stressLevel });
  setTimeout(() => res.json(result), 300);
});

app.post('/api/analyze/facial', (req, res) => {
  const { imageBase64 } = req.body || {};
  // Simple mock heuristic: derive a pseudo-random but deterministic stress level from image size
  // In a real implementation you'd run an ML model here.
  try {
    const size = imageBase64 ? Buffer.byteLength(imageBase64, 'base64') : 0;
    // Map size into 1-10 range deterministically
    const stressLevel = Math.max(1, Math.min(10, 1 + (size % 10)));
    setTimeout(() => res.json({ stressLevel }), 200);
  } catch (err) {
    res.status(400).send('Invalid image data');
  }
});

app.post('/api/analyze/text-stress', (req, res) => {
  const { text } = req.body || {};
  try {
    const t = (text || '').toLowerCase();
    // Very simple heuristic: look for words indicating higher stress
    let score = 5;
    if (/panic|anxious|anxiety|overwhelmed|stressed|stress|worried|depressed|hopeless/.test(t)) score = 8;
    else if (/tired|exhausted|sleep deprived|sleep-deprived|fatigued/.test(t)) score = 6;
    else if (/calm|relaxed|happy|joy|good|great|excited/.test(t)) score = 2;
    // Slight modulation by length (long negative journal may indicate higher stress)
    const len = t.split(/\s+/).filter(Boolean).length;
    if (len > 50 && score >= 5) score = Math.min(10, score + 1);
    setTimeout(() => res.json({ stressLevel: score }), 150);
  } catch (err) {
    res.status(400).send('Invalid text');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock AI analysis API listening on:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://0.0.0.0:${PORT}`);
});
