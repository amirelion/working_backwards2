# Working Backwards Assistant

This application helps users implement Amazon's "Working Backwards" methodology.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your OpenAI API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_api_key_here
   ```
4. Start the development server: `npm start`

## Transcription Service

For voice transcription to work, you need to run the transcription service:

1. Navigate to the `transcription-service` directory: `cd transcription-service`
2. Install dependencies: `npm install`
3. Start the transcription service: `npm start`

The service runs on port 3001 and acts as a proxy to OpenAI's Whisper API.

## Features

- Initial thoughts capture
- Working Backwards questions
- Press Release and FAQ generation
- Assumptions tracking
- Experiment planning
- AI assistance throughout the process

## Technologies

- React
- TypeScript
- Redux for state management
- Material UI for components
- OpenAI API for AI assistance
