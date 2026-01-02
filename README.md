# ThriveSense AI Wellness Assistant

An intelligent emotional expression platform that provides personalized analysis, feedback, and recommendations based on your emotional state, text input, and facial expressions.

## 🌐 Live Demo
**Production Version**: https://thrivesense.vercel.app/

## 🚀 Deploy Your Own Version

### Quick Deploy (2 Commands):
```bash
vercel login
vercel --prod
```

### Step-by-Step Guide:
1. **Login to Vercel**: `vercel login` (opens browser)
2. **Deploy**: `vercel --prod` 
3. **Get URL**: You'll receive a permanent URL like `https://your-app.vercel.app`

### Windows Users:
Double-click `deploy.bat` for guided deployment

### Detailed Instructions:
See [DEPLOY_STEPS.md](./DEPLOY_STEPS.md) for complete walkthrough

**Result**: Your app will be live worldwide with a permanent URL! 🌍

## Features

### **Intelligent Emotional Analysis**
- Advanced text analysis that detects specific emotions (anxiety, depression, anger, happiness, stress, grief, confusion, fatigue, and more)
- Context-aware mood scoring based on sleep patterns and stress levels
- Real-time emotional state assessment

### **Personalized Feedback & Recommendations**
- **Tailored Feedback**: Empathetic, personalized responses based on your specific emotional state
- **Smart Activity Suggestions**: Customized recommendations for different emotional needs:
  - Anxiety: Breathing techniques, grounding exercises
  - Depression: Gentle activities, connection suggestions
  - Anger: Physical outlets, journaling prompts
  - Stress: Mindfulness practices, priority management
  - And much more...

### **Music Therapy Integration**
- Curated song recommendations to help manage your emotional state
- Genre-specific playlists for different moods:
  - Calming music for anxiety and stress
  - Uplifting songs for depression
  - Energetic tracks for motivation
  - Processing music for grief and confusion

### **Advanced Wellness Tracking**
- **Facial Expression Analysis**: Optional client-side facial expression detection using face-api.js
- **Voice-to-Text Input**: Speak your thoughts naturally with speech recognition
- **Sleep and Stress Monitoring**: Track key wellness indicators
- **Mood Trends**: Visual charts showing your emotional patterns over time

### **AI-Powered Insights**
- Comprehensive mood analysis with detailed breakdowns
- Trend identification and pattern recognition
- Personalized wellness recommendations
- PDF export functionality for your journal entries

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Option 1: Run both servers together (Recommended)
```bash
npm run dev:full
```
This will start both the frontend (port 5173) and the mock API server (port 5050).

#### Option 2: Run servers separately
In one terminal:
```bash
npm run start:api
```

In another terminal:
```bash
npm run dev
```

### Accessing the Application

#### Local Access (Same Computer)
- **Frontend**: http://localhost:5173/
- **API**: http://localhost:5050/

#### Network Access (Other Devices)
After starting the servers, you'll see network URLs in the terminal output:
- **Frontend**: http://[YOUR_IP]:5173/ (e.g., http://10.10.135.22:5173/)
- **API**: http://[YOUR_IP]:5050/ (e.g., http://10.10.135.22:5050/)

**To access from other devices on your network:**
1. Make sure both your computer and the other device are on the same WiFi network
2. Use the Network URL shown in the terminal (e.g., `http://10.10.135.22:5173/`)
3. Ensure your firewall allows connections on ports 5173 and 5050

### Quick Network Access Setup

1. **Start the servers**:
   ```bash
   npm run dev:full
   ```

2. **Find your network URLs**: Look for the "Network" URLs in the terminal output:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://10.10.135.22:5173/  ← Use this URL for other devices
   ```

3. **Share the Network URL**: Give the Network URL to others on your WiFi network

4. **Test access**: Open the Network URL on another device (phone, tablet, another computer)

### Environment Configuration
Copy `.env.example` to `.env.local` and adjust settings as needed:
- `VITE_API_BASE_URL`: API server URL (default: http://localhost:5050)
- `VITE_USE_FACE_API`: Enable client-side facial expression analysis (true/false)

## Emotional Intelligence Features

### Supported Emotional States
- **Happiness**: Joy, excitement, positivity
- **Anxiety**: Worry, nervousness, panic, overwhelm
- **Depression**: Sadness, hopelessness, emptiness
- **Anger**: Frustration, irritation, rage
- **Stress**: Pressure, burden, exhaustion
- **Calm**: Peace, tranquility, balance
- **Grief**: Loss, mourning, bereavement
- **Confusion**: Uncertainty, mixed feelings
- **Fatigue**: Tiredness, exhaustion, low energy
- **Neutral**: Balanced, stable emotional state

### Personalized Recommendations
Each emotional state receives:
- **Specific feedback** tailored to that emotion
- **Targeted activities** designed to help with that particular feeling
- **Music recommendations** scientifically chosen to support emotional regulation
- **Coping strategies** based on evidence-based therapeutic approaches

## Troubleshooting

### Local Access Issues
If you see "Failed to fetch" or "Analysis service temporarily unavailable" errors:
1. Make sure the API server is running on port 5050
2. Check that `VITE_API_BASE_URL` in `.env.local` points to the correct API URL
3. Try running `npm run dev:full` to start both servers together
4. Refresh your browser after making environment changes

### Network Access Issues
If other devices can't access the application:
1. **Check Network Connection**: Ensure both devices are on the same WiFi network
2. **Firewall Settings**: 
   - Windows: Allow Node.js through Windows Defender Firewall
   - Add exceptions for ports 5173 and 5050
3. **IP Address**: Use the exact IP shown in the Vite terminal output
4. **Router Settings**: Some routers block device-to-device communication (AP isolation)
5. **Antivirus**: Temporarily disable antivirus to test if it's blocking connections

### Common Network Access Commands
```bash
# Check your IP address (Windows)
ipconfig

# Test if the server is accessible from another device
# Run this from the other device (replace IP with your actual IP):
curl http://10.10.135.22:5173
```

## Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **AI/ML**: face-api.js for facial expression analysis
- **Charts**: Recharts for mood visualization
- **PDF Generation**: jsPDF for export functionality
- **Build Tool**: Vite for fast development and building
