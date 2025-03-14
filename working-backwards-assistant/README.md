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

## Recent Improvements

### Form State and Suggestions Optimization

The app has been optimized to improve the Working Backwards flow:

1. **Streamlined Process Flow**: Removed redundant initial thoughts processing step. Users can now proceed directly from initial thoughts to Working Backwards questions.

2. **Enhanced AI Suggestions**:
   - AI suggestions are now generated per question with proper context from previous answers
   - All suggestions are automatically saved to Firestore for persistence
   - Improved error handling and logging for suggestion generation

3. **Auto-save Improvements**:
   - More reliable auto-saving for form state
   - Progressive saving during lengthy operations to prevent data loss

These changes make the Working Backwards process more efficient while ensuring all data is properly persisted.
