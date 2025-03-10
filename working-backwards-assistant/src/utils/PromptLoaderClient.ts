/**
 * Frontend-compatible PromptLoader
 * Loads prompt templates from JSON files and fills in variables
 */

import initialThoughtsPrompts from '../config/prompts/initialThoughts.json';
import workingBackwardsPrompts from '../config/prompts/workingBackwards.json';
import pressReleasePrompts from '../config/prompts/pressRelease.json';
import faqsPrompts from '../config/prompts/faqs.json';
import experimentsPrompts from '../config/prompts/experiments.json';

export interface PromptConfig {
  id: string;
  description: string;
  defaults: {
    provider: string;
    model: string;
    temperature: number;
  };
  template: string;
  contextVariables: string[];
}

export interface PromptCategory {
  [promptId: string]: PromptConfig;
}

/**
 * Frontend-compatible PromptLoader singleton
 * Loads and processes templates from imported JSON files
 */
export class PromptLoaderClient {
  private static instance: PromptLoaderClient;
  private promptConfigs: Record<string, PromptCategory>;

  private constructor() {
    // Load all prompt configurations from imported JSON
    this.promptConfigs = {
      initialThoughts: initialThoughtsPrompts,
      workingBackwards: workingBackwardsPrompts,
      pressRelease: pressReleasePrompts,
      faqs: faqsPrompts,
      experiments: experimentsPrompts
    };
  }

  public static getInstance(): PromptLoaderClient {
    if (!PromptLoaderClient.instance) {
      PromptLoaderClient.instance = new PromptLoaderClient();
    }
    return PromptLoaderClient.instance;
  }

  public getPromptConfig(category: string, promptId: string): PromptConfig {
    if (!this.promptConfigs[category]) {
      throw new Error(`Unknown prompt category: ${category}`);
    }

    const config = this.promptConfigs[category][promptId];
    if (!config) {
      throw new Error(`Unknown prompt ID '${promptId}' in category '${category}'`);
    }

    return config;
  }

  public buildPrompt(
    category: string,
    promptId: string,
    options: {
      variables: Record<string, any>;
      overrides?: Partial<PromptConfig['defaults']>;
    }
  ): { prompt: string; settings: PromptConfig['defaults'] } {
    const config = this.getPromptConfig(category, promptId);
    let prompt = config.template;

    // Validate required variables
    const missingVars = config.contextVariables.filter(
      (varName) => !options.variables.hasOwnProperty(varName)
    );
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required variables for prompt '${promptId}': ${missingVars.join(', ')}`
      );
    }

    // Replace variables in template
    for (const [key, value] of Object.entries(options.variables)) {
      // Handle conditional blocks
      const ifRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, 'g');
      prompt = prompt.replace(ifRegex, value ? '$1' : '');

      // Handle each blocks for arrays
      if (Array.isArray(value)) {
        const eachRegex = new RegExp(`{{#each ${key}}}([\\s\\S]*?){{/each}}`, 'g');
        prompt = prompt.replace(eachRegex, (_, template) => {
          return value.map((item, index) => {
            let itemTemplate = template;
            // Replace @index with the current index
            itemTemplate = itemTemplate.replace(/{{@index}}/g, index.toString());
            // Replace add @index 1 with the current index + 1
            itemTemplate = itemTemplate.replace(/{{add @index 1}}/g, (index + 1).toString());
            // Replace item properties
            if (typeof item === 'object') {
              for (const [propKey, propValue] of Object.entries(item)) {
                itemTemplate = itemTemplate.replace(
                  new RegExp(`{{${propKey}}}`, 'g'),
                  propValue as string
                );
              }
            } else {
              itemTemplate = itemTemplate.replace(/{{this}}/g, item.toString());
            }
            return itemTemplate;
          }).join('');
        });
      }

      // Replace simple variables
      const regex = new RegExp(`{{${key}}}`, 'g');
      prompt = prompt.replace(regex, value?.toString() || '');
    }

    // Clean up any remaining conditional blocks
    prompt = prompt.replace(/{{#if [\w]+}}[\s\S]*?{{\/if}}/g, '');
    prompt = prompt.replace(/{{#each [\w]+}}[\s\S]*?{{\/each}}/g, '');

    // Merge default settings with overrides
    const settings = {
      ...config.defaults,
      ...options.overrides
    };

    return { prompt, settings };
  }
} 