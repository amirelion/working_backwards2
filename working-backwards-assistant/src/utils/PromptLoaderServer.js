/**
 * Server-side PromptLoader
 * A simplified version of PromptLoader for use in the server
 */

const fs = require('fs');
const path = require('path');

class PromptLoader {
  constructor() {
    this.promptConfigs = {};
    this.loadPromptConfigs();
  }

  static getInstance() {
    if (!PromptLoader.instance) {
      PromptLoader.instance = new PromptLoader();
    }
    return PromptLoader.instance;
  }

  loadPromptConfigs() {
    const configDir = path.join(__dirname, '../../config/prompts');
    try {
      // Load initialThoughts.json
      const initialThoughtsPath = path.join(configDir, 'initialThoughts.json');
      if (fs.existsSync(initialThoughtsPath)) {
        this.promptConfigs.initialThoughts = JSON.parse(fs.readFileSync(initialThoughtsPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading prompt configs:', error);
    }
  }

  async buildPrompt(category, promptId, options) {
    if (!this.promptConfigs[category]) {
      throw new Error(`Unknown prompt category: ${category}`);
    }

    const config = this.promptConfigs[category][promptId];
    if (!config) {
      throw new Error(`Unknown prompt ID '${promptId}' in category '${category}'`);
    }

    let promptText = config.template;
    const { variables } = options;

    // Replace variables in template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      promptText = promptText.replace(regex, value?.toString() || '');
    }

    return { prompt: promptText, settings: config.defaults || {} };
  }
}

module.exports = { PromptLoader }; 