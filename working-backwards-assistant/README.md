# Working Backwards Innovation Assistant

This application helps users innovate like Amazon using the Working Backwards methodology through guided AI conversations and document generation.

## Features

- **Working Backwards Journey Engine**: Guided conversational flows for the full Working Backwards process
- **PRFAQ Generator & Editor**: AI-assisted drafting and editing of Press Release and FAQ documents
- **Documents & Knowledge Hub**: Templates and examples from various industries
- **Testing & Validation Platform**: Tools for testing key assumptions and tracking experiment outcomes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your AI API keys:
   ```
   REACT_APP_AI_PROVIDER=openai
   REACT_APP_AI_MODEL=gpt-4o-mini
   REACT_APP_AI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```
   npm start
   ```

## Project Structure

- `/src/components`: Reusable UI components
- `/src/pages`: Main application pages
- `/src/services`: API and service integrations
- `/src/store`: Redux state management
- `/src/types`: TypeScript type definitions
- `/src/utils`: Utility functions and helpers

## Usage

1. Start on the landing page to learn about the Working Backwards methodology
2. Begin the guided process by answering key questions about your innovation
3. Generate and refine your PRFAQ document
4. Design experiments to test your key assumptions
5. Export your documents in various formats

## License

This project is licensed under the MIT License - see the LICENSE file for details.
