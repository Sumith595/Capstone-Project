import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry } from '../../types';
import { analyzeWellness, analyzeWellnessTextOnly, analyzeStressFromImage, analyzeStressFromText } from '../../services/geminiService';
import type * as FaceAPIType from 'face-api.js';

interface InteractionPanelProps {
  onNewEntry: (entry: JournalEntry) => void;
}

const InteractionPanel: React.FC<InteractionPanelProps> = ({ onNewEntry }) => {
  const [text, setText] = useState('');
  const [sleepHours, setSleepHours] = useState(8);
  const [stressLevel, setStressLevel] = useState(5);
  const [facialImage, setFacialImage] = useState<string | undefined>(undefined); // Now holds the full data URI
  const [facialEmotion, setFacialEmotion] = useState<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null); // For SpeechRecognition
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEstimatingStress, setIsEstimatingStress] = useState(false);
  const textDebounceRef = useRef<number | null>(null);
  const faceApiRef = useRef<typeof FaceAPIType | null>(null);
  const modelsLoadedRef = useRef(false);
  const useFaceApi = true; // Re-enabled real facial expression detection

  console.log('InteractionPanel loaded - useFaceApi:', useFaceApi);

  useEffect(() => {
    // Clear any initial errors
    setError(null);
    
    try {
      // FIX: Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'.
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('❌ Speech Recognition not supported by this browser.');
        return;
      }

      console.log('✅ SpeechRecognition API available');
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Configure recognition
      recognition.continuous = false; // Stop after silence
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('🎤 Recording started - speak now');
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        console.log('🎤 [ONRESULT] Speech detected - event:', event);
        console.log('🎤 [ONRESULT] resultIndex:', event.resultIndex, 'results.length:', event.results.length);
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          console.log(`[${i}] transcript="${transcript}" isFinal=${event.results[i].isFinal}`);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            console.log('✅ Final added:', transcript);
          } else {
            interimTranscript += transcript;
            console.log('⏳ Interim added:', transcript);
          }
        }

        console.log('📝 finalTranscript:', `"${finalTranscript}"`, 'length:', finalTranscript.length);
        
        if (finalTranscript && finalTranscript.trim()) {
          console.log('📝 Setting text with:', finalTranscript);
          setText(prevText => {
            const newText = prevText + finalTranscript;
            console.log('📝 Text updated, new value:', newText);
            return newText;
          });
          
          // Detect emotion from transcribed text
          const textLower = finalTranscript.toLowerCase();
          console.log('🔍 Analyzing emotion from:', textLower);
          let detectedEmotion = 'neutral';
          
          if (/happy|joy|excited|great|amazing|wonderful|fantastic|good|positive|cheerful|love|laugh/i.test(textLower)) {
            detectedEmotion = 'happy';
            console.log('😊 Detected emotion from audio: HAPPY');
          } else if (/sad|depressed|hopeless|empty|worthless|lonely|down|blue|miserable|cry/i.test(textLower)) {
            detectedEmotion = 'sad';
            console.log('😢 Detected emotion from audio: SAD');
          } else if (/angry|mad|furious|irritated|frustrated|rage|annoyed|hate/i.test(textLower)) {
            detectedEmotion = 'angry';
            console.log('😠 Detected emotion from audio: ANGRY');
          } else if (/anxious|anxiety|panic|worried|nervous|fear|scared|overwhelmed|restless/i.test(textLower)) {
            detectedEmotion = 'fearful';
            console.log('😨 Detected emotion from audio: FEARFUL');
          } else if (/calm|peaceful|relaxed|serene|tranquil|content|balanced/i.test(textLower)) {
            detectedEmotion = 'neutral';
            console.log('😌 Detected emotion from audio: CALM');
          } else {
            console.log('❓ No emotion keywords matched, defaulting to neutral');
          }
          
          setFacialEmotion(detectedEmotion);
          console.log('🎯 Facial emotion set to:', detectedEmotion);
        } else {
          console.log('⚠️ No finalTranscript, skipping emotion detection');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log('🎤 Recording ended');
        setIsRecording(false);
      };
    } catch (err) {
      console.error('❌ Error initializing SpeechRecognition:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Voice cleanup:', e);
        }
      }
    };
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      console.error('❌ SpeechRecognition not initialized');
      setError('Voice recording not available in your browser');
      return;
    }
    
    try {
      if (isRecording) {
        console.log('⏹️ Stopping recording...');
        recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        console.log('🎤 Starting recording... Speak now!');
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (err) {
      console.error('❌ Error toggling recording:', err);
      setError('Error with voice recording');
      setIsRecording(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setFacialImage(result); // Store the full data URI
        // Try to compute stress level from the uploaded image (prefer client-side face-api when enabled)
        try {
          const parts = result.split(',');
          const imageBase64 = parts[1];
          const mimeMatch = parts[0].match(/:(.*?);/);
          const imageMimeType = mimeMatch ? mimeMatch[1] : 'image/png';
          if (imageBase64) {
            // stop any ongoing text-based estimation
            if (textDebounceRef.current) {
              clearTimeout(textDebounceRef.current);
              textDebounceRef.current = null;
            }
            setIsEstimatingStress(true);

            if (useFaceApi) {
              console.log('🚀 Starting face-api.js facial expression detection');
              try {
                // lazy-load face-api.js and models
                if (!faceApiRef.current) {
                  console.log('Loading face-api.js library...');
                  // dynamic import so bundler doesn't break if package missing
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  const faceapi = await import('face-api.js');
                  faceApiRef.current = faceapi as unknown as typeof FaceAPIType;
                  console.log('📚 face-api.js library loaded successfully:', !!faceApiRef.current);
                }
                if (!modelsLoadedRef.current) {
                  // Prefer local models hosted at /models (Vite serves public/ as root)
                  const localModelUrl = '/models';
                  const cdnModelUrl = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
                  // Try local first, then fallback to CDN
                  const tryLoad = async (baseUrl: string) => {
                    console.log('Attempting to load models from:', baseUrl);
                    await Promise.all([
                      faceApiRef.current!.nets.tinyFaceDetector.loadFromUri(baseUrl),
                      faceApiRef.current!.nets.faceExpressionNet.loadFromUri(baseUrl),
                    ]);
                    console.log('Successfully loaded models from:', baseUrl);
                  };

                  try {
                    await tryLoad(localModelUrl);
                    console.log('✅ Models loaded from local /models directory');
                    modelsLoadedRef.current = true;
                  } catch (localErr) {
                    console.warn('❌ Local face-api models failed to load from /models, trying CDN...', localErr);
                    try {
                      await tryLoad(cdnModelUrl);
                      console.log('✅ Models loaded from CDN fallback');
                      modelsLoadedRef.current = true;
                    } catch (cdnErr) {
                      console.error('❌ Both local and CDN model loading failed!', cdnErr);
                      throw cdnErr;
                    }
                  }

                  modelsLoadedRef.current = true;
                }

                // create image element for face-api
                const img = new Image();
                img.src = result;
                console.log('🖼️ Loading image for face detection, src length:', result.length);
                await img.decode();
                console.log('🖼️ Image decoded successfully, dimensions:', img.width, 'x', img.height);
                const detection = (await faceApiRef.current!.detectSingleFace(
                  img,
                  new faceApiRef.current!.TinyFaceDetectorOptions()
                ).withFaceExpressions()) as any;

                console.log('🔍 Detection result:', detection ? 'Face found' : 'No face found');
                console.log('🔍 Detection object:', detection);

                if (detection?.expressions) {
                  const e = detection.expressions as unknown as Record<string, number>;
                  console.log('🎯 FACE DETECTED! Raw expressions:', { 
                    happy: e.happy,
                    sad: e.sad,
                    angry: e.angry,
                    fearful: e.fearful,
                    disgusted: e.disgusted,
                    surprised: e.surprised,
                    neutral: e.neutral
                  });
                  
                  // Find the dominant expression
                  const expressions = {
                    angry: e.angry || 0,
                    disgusted: e.disgusted || 0,
                    fearful: e.fearful || 0,
                    happy: e.happy || 0,
                    neutral: e.neutral || 0,
                    sad: e.sad || 0,
                    surprised: e.surprised || 0
                  };
                  
                  // Get the expression with highest confidence
                  const dominant = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
                  console.log('🎯 Dominant expression:', dominant[0], 'confidence:', dominant[1]);
                  
                  setFacialEmotion(dominant[0]);
                  console.log('🎯 facialEmotion state set to:', dominant[0]);
                  
                  // Calculate stress based on ALL emotions, not just dominant
                  // This gives better results when face-api detects multiple emotions
                  let score = 5; // baseline
                  score += (expressions.angry * 5);      // angry adds stress
                  score += (expressions.fearful * 5);    // fear adds stress
                  score += (expressions.sad * 4);        // sadness adds stress
                  score += (expressions.disgusted * 3);  // disgust adds some stress
                  score += (expressions.surprised * 1);  // surprise adds a bit
                  score -= (expressions.happy * 4);      // happiness reduces stress
                  score -= (expressions.neutral * 1);    // neutral slightly reduces
                  
                  score = Math.round(Math.max(1, Math.min(10, score)));
                  console.log('🎯 Calculated stress level:', score);
                  setStressLevel(score);
                  setIsEstimatingStress(false);
                } else {
                  console.warn('❌ No face detected, falling back to server-side estimation');
                  // fallback to server-side estimation
                  const estimated = await analyzeStressFromImage({ imageBase64, imageMimeType });
                  setStressLevel(Number(estimated.stressLevel));
                  setFacialEmotion(estimated.emotion);
                  setIsEstimatingStress(false);
                }
              } catch (err) {
                console.warn('❌ Client-side face-api detection failed, falling back to server', err);
                const estimated = await analyzeStressFromImage({ imageBase64, imageMimeType });
                setStressLevel(Number(estimated.stressLevel));
                setFacialEmotion(estimated.emotion);
                setIsEstimatingStress(false);
              }
            } else {
              // No face-api available, use server-side estimation
              try {
                const result = await analyzeStressFromImage({ imageBase64, imageMimeType });
                setStressLevel(result.stressLevel);
                setFacialEmotion(result.emotion);
              } catch (err) {
                console.error('Server-side facial estimation failed', err);
                setStressLevel(5);
                setFacialEmotion(undefined);
              } finally {
                setIsEstimatingStress(false);
              }
            }
          }
        } catch (err) {
          console.warn('Error processing uploaded image for stress estimation', err);
          setIsEstimatingStress(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the selected file.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Live, debounced text-based stress estimation (when no photo is present)
  useEffect(() => {
    if (facialImage) {
      // Skip text-based estimation when an image is present
      setIsEstimatingStress(false);
      if (textDebounceRef.current) {
        clearTimeout(textDebounceRef.current);
        textDebounceRef.current = null;
      }
      return;
    }

    if (textDebounceRef.current) {
      clearTimeout(textDebounceRef.current);
      textDebounceRef.current = null;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      setStressLevel(5);
      setIsEstimatingStress(false);
      return;
    }

    setIsEstimatingStress(true);
    // debounce before making request
    textDebounceRef.current = window.setTimeout(async () => {
      try {
        const estimated = await analyzeStressFromText({ text: trimmed });
        setStressLevel(Number(estimated));
        // Clear any previous errors on successful estimation
        if (error) setError(null);
      } catch (err) {
        console.warn('Live text-based stress estimation failed', err);
        // Don't set error for background estimation failures
        // setError('Stress estimation failed, using default value');
      } finally {
        setIsEstimatingStress(false);
        textDebounceRef.current = null;
      }
    }, 700);

    return () => {
      if (textDebounceRef.current) {
        clearTimeout(textDebounceRef.current);
        textDebounceRef.current = null;
      }
    };
  }, [text, facialImage]);

  const handleClearPhoto = () => {
    setFacialImage(undefined);
    setStressLevel(5);
    if(fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !facialImage && !facialEmotion) {
      setError("Please add a journal entry, upload a photo, or record your voice to continue.");
      return;
    }
    
    // If we have a facial image but no emotion detected yet, wait for detection
    if (facialImage && !facialEmotion) {
      setError("Please wait for facial analysis to complete before submitting.");
      return;
    }
    
    setIsLoading(true);
    setError(null); // Clear any previous errors
    try {
      let analysis;

      if (facialImage) {
        const parts = facialImage.split(',');
        const mimeTypePart = parts[0].match(/:(.*?);/);
        const imageMimeType = mimeTypePart ? mimeTypePart[1] : undefined;
        const imageBase64 = parts[1];

        if (imageBase64 && imageMimeType) {
            // FOR FACIAL IMAGES: Completely ignore text input - only use facial emotion
            console.log('Facial image detected - IGNORING any text input');
            
            // Ensure we have facial emotion before proceeding
            if (!facialEmotion) {
              console.warn('No facial emotion detected, cannot proceed with analysis');
              setError("Please upload a clear facial image first.");
              setIsLoading(false);
              return;
            }
            
            console.log('facialEmotion before analyzeWellness:', facialEmotion, '| Type:', typeof facialEmotion);
            console.log('Sending to server: NO TEXT, facialEmotion:', facialEmotion, 'stressLevel:', stressLevel);
            
            // Force facialEmotion to be a string if it's set
            const emotionToSend = facialEmotion || 'neutral';
            console.log('Final emotionToSend:', emotionToSend, '| Was facialEmotion falsy?', !facialEmotion);
            
            const paramsToSend = { 
              text: '', // FORCE empty - facial analysis only
              sleepHours, 
              stressLevel, 
              facialEmotion: emotionToSend,
              imageBase64, 
              imageMimeType 
            };
            console.log('Complete params being sent:', Object.keys(paramsToSend));
            
            analysis = await analyzeWellness(paramsToSend);
            console.log('Analysis result:', analysis);
        } else {
            // This case might happen if data URI is malformed, so we treat it as text-only
            // but we need to ensure text is present
             if(!text.trim()) {
                throw new Error("Invalid image format. Please upload a valid image or add a text entry.");
             }
            analysis = await analyzeWellnessTextOnly({ text, sleepHours, stressLevel });
        }
      } else {
          // No image, but check if we have facial emotion from voice recording
          if (facialEmotion && !text.trim()) {
            // Voice-only analysis: just the detected emotion from audio
            console.log('Voice recording detected - facialEmotion from audio:', facialEmotion);
            analysis = await analyzeWellness({ 
              text: '', 
              sleepHours, 
              stressLevel,
              facialEmotion,
              imageBase64: '',
              imageMimeType: ''
            });
          } else if (text.trim()) {
            // Text input detected
            try {
              const estimated = await analyzeStressFromText({ text });
              setStressLevel(Number(estimated));
              // If we also have facial emotion from voice, use it; otherwise use text-only
              if (facialEmotion) {
                console.log('Combining voice emotion with text input:', facialEmotion);
                analysis = await analyzeWellness({ 
                  text, 
                  sleepHours, 
                  stressLevel: Number(estimated),
                  facialEmotion,
                  imageBase64: '',
                  imageMimeType: ''
                });
              } else {
                // Text only, no voice emotion
                analysis = await analyzeWellnessTextOnly({ text, sleepHours, stressLevel: Number(estimated) });
              }
            } catch (err) {
              console.warn('Text-based stress estimation failed', err);
              if (facialEmotion) {
                analysis = await analyzeWellness({ 
                  text, 
                  sleepHours, 
                  stressLevel,
                  facialEmotion,
                  imageBase64: '',
                  imageMimeType: ''
                });
              } else {
                analysis = await analyzeWellnessTextOnly({ text, sleepHours, stressLevel });
              }
            }
          } else {
            // Fallback: shouldn't reach here because of validation
            analysis = await analyzeWellnessTextOnly({ text, sleepHours, stressLevel });
          }
      }

      const newEntry: JournalEntry = {
        id: new Date().toISOString() + Math.random().toString(36),
        date: new Date().toISOString(),
        transcribedText: text,
        analysis,
        facialImage: undefined, // Don't store images to avoid localStorage quota issues
        sleepHours,
        stressLevel,
        facialEmotion
      };

      onNewEntry(newEntry);

      // Reset form
      setText('');
      setSleepHours(8);
      setStressLevel(5);
      setFacialImage(undefined);
      setFacialEmotion(undefined);
      if(fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
        setError('Unable to connect to analysis server. Please check if the API server is running.');
      } else if (errorMessage.includes('Analysis API error')) {
        setError('Analysis service temporarily unavailable. Please try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg p-6 space-y-6 ring-1 ring-slate-700">
      <h2 className="text-xl font-bold text-slate-100">Create a New Entry</h2>
      
      {/* Journal Text Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // Clear any previous errors when user starts typing
            if (error) setError(null);
          }}
          placeholder="How are you feeling today? You can type or use the microphone to speak."
          className="w-full h-40 bg-slate-700 text-slate-200 p-4 rounded-lg border border-slate-600 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none transition"
          disabled={isLoading}
        />
        <button 
          onClick={handleToggleRecording}
          title={isRecording ? "Stop Recording" : "Start Recording"}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'}`}
          disabled={isLoading}
        >
          {/* Microphone Icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v1h6v-1h-2v-2.07z" clipRule="evenodd" /></svg>
        </button>
      </div>

      {/* Metrics Sliders */}
      <div className="space-y-4">
        <div>
          <label htmlFor="sleep" className="flex justify-between text-sm font-medium text-slate-300 mb-1">
            <span>Hours of Sleep</span>
            <span className="font-bold text-amber-400">{sleepHours} hrs</span>
          </label>
          <input
            id="sleep"
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="flex justify-between text-sm font-medium text-slate-300 mb-1">
            <span>Estimated Stress Level</span>
            <span className="font-bold text-amber-400">{stressLevel} / 10</span>
          </label>
          <p className="text-xs text-slate-400">
            {facialImage
              ? 'Estimated from uploaded photo.'
              : isEstimatingStress
              ? 'Estimating from text...'
              : 'Estimated from text input.'}
          </p>
        </div>
      </div>
      
      {/* Facial Image Upload */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-300">Facial Expression (Optional)</p>
        <div className="bg-slate-700 rounded-lg p-4 flex flex-col items-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
          {facialImage ? (
            <div className="relative">
              <img src={facialImage} alt="Uploaded facial expression" className="w-full max-w-xs h-auto rounded-md" />
              <button onClick={handleClearPhoto} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors" title="Remove Photo">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ) : (
            <button onClick={handleUploadClick} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Upload Photo
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-center text-red-400">{error}</p>}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || (!text.trim() && !facialImage)}
        className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg transition-transform transform hover:scale-105 disabled:bg-amber-500/50 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? 'Analyzing...' : 'Save & Analyze Entry'}
      </button>
    </div>
  );
};

export default InteractionPanel;