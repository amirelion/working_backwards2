import fs from 'fs';
import path from 'path';
import { PromptConfig, PromptContext, PromptError } from '../types/prompts';

const PROMPTS_DIR = path.join(process.cwd(), 'src', 'config', 'prompts');
const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

export class PromptLoader {
  private static instance: PromptLoader;
  private configCache: Map<string, PromptConfig> = new Map();

  private constructor() {}

  static getInstance(): PromptLoader {
    if (!PromptLoader.instance) {
      PromptLoader.instance = new PromptLoader();
    }
    return PromptLoader.instance;
  }

  async loadConfig(category: string, promptId: string): Promise<PromptConfig> {
    const cacheKey = `${category}:${promptId}`;
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey)!;
    }

    try {
      const filePath = path.join(PROMPTS_DIR, `${category}.json`);
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      const configs = JSON.parse(fileContent);
      
      if (!configs[promptId]) {
        throw this.createError('MISSING_CONFIG', `Prompt ${promptId} not found in ${category}`);
      }

      const config = configs[promptId] as PromptConfig;
      this.configCache.set(cacheKey, config);
      return config;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      throw this.createError('LOAD_ERROR', `Failed to load prompt config: ${error}`);
    }
  }

  async buildPrompt(category: string, promptId: string, context: PromptContext): Promise<string> {
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

  private validateContext(config: PromptConfig, context: PromptContext): string[] {
    return config.contextVariables.filter(
      varName => !(varName in context.variables)
    );
  }

  private substituteVariables(template: string, variables: Record<string, any>): string {
    return template.replace(VARIABLE_REGEX, (_, varName) => {
      return String(variables[varName] ?? '');
    });
  }

  private createError(code: PromptError['code'], message: string, details?: Record<string, unknown>): PromptError {
    const error = new Error(message) as PromptError;
    error.code = code;
    error.details = details;
    return error;
  }
} 