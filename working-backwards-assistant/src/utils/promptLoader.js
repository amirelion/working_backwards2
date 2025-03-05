const fs = require('fs').promises;
const path = require('path');

const PROMPTS_DIR = path.join(process.cwd(), 'src', 'config', 'prompts');
const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

class PromptLoader {
  static instance;
  configCache = new Map();

  constructor() {}

  static getInstance() {
    if (!PromptLoader.instance) {
      PromptLoader.instance = new PromptLoader();
    }
    return PromptLoader.instance;
  }

  async loadConfig(category, promptId) {
    const cacheKey = `${category}:${promptId}`;
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey);
    }

    try {
      const filePath = path.join(PROMPTS_DIR, `${category}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const configs = JSON.parse(fileContent);
      
      if (!configs[promptId]) {
        throw this.createError('MISSING_CONFIG', `Prompt ${promptId} not found in ${category}`);
      }

      const config = configs[promptId];
      this.configCache.set(cacheKey, config);
      return config;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      throw this.createError('LOAD_ERROR', `Failed to load prompt config: ${error}`);
    }
  }

  async buildPrompt(category, promptId, context) {
    const config = await this.loadConfig(category, promptId);
    const missingVars = this.validateContext(config, context);
    
    if (missingVars.length > 0) {
      throw this.createError('MISSING_VARIABLES', 
        `Missing required variables: ${missingVars.join(', ')}`,
        { missingVars }
      );
    }

    return this.substituteVariables(config.template, context.variables);
  }

  validateContext(config, context) {
    return config.contextVariables.filter(
      varName => !(varName in context.variables)
    );
  }

  substituteVariables(template, variables) {
    return template.replace(VARIABLE_REGEX, (_, varName) => {
      return String(variables[varName] ?? '');
    });
  }

  createError(code, message, details) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
  }
}

module.exports = { PromptLoader }; 