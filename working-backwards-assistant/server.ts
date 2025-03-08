import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import PromptLoader from './src/services/PromptLoader';

dotenv.config();

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
  apiKey: process.env.OPENAI_API_KEY || process.env.REACT_APP_AI_API_KEY,
});

// Handle OPTIONS requests
app.options('*', cors());

// Transcribe API endpoint
app.post('/api/transcribe', upload.single('file'), async (req: Request, res: Response) => {
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
        details: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Process thoughts API endpoint
app.post('/api/process-thoughts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Processing initial thoughts:', text.substring(0, 100) + '...');

    try {
      // Load the prompt configuration
      const promptLoader = PromptLoader.getInstance();
      const { prompt, settings } = await promptLoader.buildPrompt('initialThoughts', 'processInitialThoughts', {
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

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Parse the JSON response
      const suggestions = JSON.parse(content);
      console.log('AI suggestions:', suggestions);

      return res.status(200).json(suggestions);
    } catch (aiError: any) {
      console.error('OpenAI API error details:', aiError);
      
      // Handle timeouts and specific API errors differently
      if (aiError.message?.includes('timeout') || aiError.message?.includes('rate limit')) {
        return res.status(503).json({ 
          error: 'AI service is temporarily unavailable', 
          details: aiError instanceof Error ? aiError.message : String(aiError),
          retryable: true
        });
      }
      
      // For other AI errors, return a 500 but with clear message
      return res.status(500).json({ 
        error: 'AI processing failed', 
        details: aiError instanceof Error ? aiError.message : String(aiError)
      });
    }
  } catch (error) {
    console.error('Server error in process-thoughts endpoint:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Generate suggestion for a specific question
app.post('/api/generate-suggestion', async (req: Request, res: Response) => {
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

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Return the suggestion
    return res.status(200).json({ 
      content: content.trim()
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Suggestion generation failed', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 