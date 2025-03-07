/**
 * AI Service Constants
 * Shared constants used across AI services
 */

// Default AI provider and model from environment variables
export const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'openai';
export const AI_MODEL = process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini';
export const AI_API_KEY = process.env.REACT_APP_AI_API_KEY || ''; 