const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');
require('dotenv').config();
const { PromptLoader } = require('./src/utils/promptLoader');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, 'tmp', 'uploads');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    }
  })
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_AI_API_KEY,
});

// Handle OPTIONS requests
app.options('*', cors());

// Transcribe API endpoint
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    try {
      // Call OpenAI's Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
      });

      // Clean up the temporary file
      fs.unlinkSync(filePath);

      // Return the transcription
      return res.status(200).json({ text: transcription.text });
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Clean up the temporary file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return res.status(500).json({ 
        error: 'Transcription failed', 
        details: error.message 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Process thoughts API endpoint
app.post('/api/process-thoughts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Processing initial thoughts:', text.substring(0, 100) + '...');

    // Load the prompt configuration
    const promptLoader = PromptLoader.getInstance();
    const prompt = await promptLoader.buildPrompt('initialThoughts', 'processInitialThoughts', {
      variables: { text }
    });

    // Call OpenAI API to process the text
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI assistant that helps extract insights from initial product thoughts to support the Amazon Working Backwards process." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const suggestions = JSON.parse(completion.choices[0].message.content);
    console.log('AI suggestions:', suggestions);

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: error.message 
    });
  }
});

// Generate suggestion for a specific question
app.post('/api/generate-suggestion', async (req, res) => {
  try {
    const { prompt, model, provider } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Generating suggestion for prompt:', prompt.substring(0, 100) + '...');

    // Call OpenAI API to generate a suggestion
    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI assistant that helps with the Amazon Working Backwards process." },
        { role: "user", content: prompt }
      ]
    });

    // Return the suggestion
    return res.status(200).json({ 
      content: completion.choices[0].message.content.trim() 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Suggestion generation failed', 
      details: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 