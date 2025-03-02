import { OpenAI } from 'openai';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.diskStorage({
    destination: '/tmp/uploads/',
    filename: (req, file, cb) => {
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    }
  })
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use multer to handle the file upload
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'File upload failed' });
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
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
} 