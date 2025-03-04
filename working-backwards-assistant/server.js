const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

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

    // Define the prompt for extracting insights
    const prompt = `
      You are an expert in Amazon's Working Backwards process. 
      
      Analyze the following initial thoughts about a product or service idea and extract key insights to help answer the Working Backwards questions.
      
      Initial thoughts:
      ${text}
      
      Based on these thoughts, provide suggested answers for the following Working Backwards questions:
      
      1. Who is the customer?
      2. What is the customer problem or opportunity?
      3. What is the most important customer benefit?
      4. How do you know what customers need or want?
      5. What does the customer experience look like?
      
      Format your response as a JSON object with keys corresponding to each question number (use only the number as the key) and values containing the suggested answers. For example:
      {
        "1": "Answer to question 1",
        "2": "Answer to question 2",
        "3": "Answer to question 3",
        "4": "Answer to question 4",
        "5": "Answer to question 5"
      }
    `;

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

    // Return the suggestions
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 