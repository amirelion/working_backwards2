import { PromptConfig, PromptCategory } from '../types/prompts';

class PromptLoader {
  private static instance: PromptLoader;
  private promptConfigs: Record<string, PromptCategory> = {};

  private constructor() {
    // Load all prompt configurations
    this.loadPromptConfigs();
  }

  public static getInstance(): PromptLoader {
    if (!PromptLoader.instance) {
      PromptLoader.instance = new PromptLoader();
    }
    return PromptLoader.instance;
  }

  private loadPromptConfigs() {
    // Clear require cache for prompt configs
    Object.keys(require.cache).forEach(key => {
      if (key.includes('/config/prompts/')) {
        delete require.cache[key];
      }
    });

    // Import all JSON configurations
    this.promptConfigs = {
      initialThoughts: require('../config/prompts/initialThoughts.json'),
      workingBackwards: require('../config/prompts/workingBackwards.json'),
      pressRelease: require('../config/prompts/pressRelease.json'),
      faqs: require('../config/prompts/faqs.json'),
      experiments: require('../config/prompts/experiments.json'),
      assumptions: require('../config/prompts/assumptions.json')
    };
  }

  public getPromptConfig(category: string, promptId: string): PromptConfig {
    if (!this.promptConfigs[category]) {
      throw new Error(`Unknown prompt category: ${category}`);
    }

    // Handle nested paths like 'questionPrompts.customer'
    if (promptId.includes('.')) {
      const [section, id] = promptId.split('.');
      
      if (!this.promptConfigs[category][section]) {
        throw new Error(`Unknown section '${section}' in category '${category}'`);
      }
      
      const nestedConfig = (this.promptConfigs[category][section] as Record<string, PromptConfig>)[id];
      
      if (!nestedConfig) {
        throw new Error(`Unknown prompt ID '${id}' in section '${section}' of category '${category}'`);
      }
      
      return nestedConfig;
    }
    
    // Handle regular non-nested prompts
    const config = this.promptConfigs[category][promptId];
    if (!config) {
      throw new Error(`Unknown prompt ID '${promptId}' in category '${category}'`);
    }
    
    // Only return if it's a PromptConfig (not a nested object)
    if (!config.template || !config.id) {
      throw new Error(`Invalid prompt configuration for '${promptId}' in category '${category}'`);
    }

    return config as PromptConfig;
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

  /**
   * Get raw prompt data for a category without processing
   * Used for accessing nested configurations like categoryGuidance
   * 
   * @param category - The prompt category
   * @returns The raw prompt category data
   */
  public getRawPromptData(category: string): any {
    return this.promptConfigs[category] || null;
  }
}

export default PromptLoader; 