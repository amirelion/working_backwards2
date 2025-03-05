# AI Prompt Configurations

This directory contains JSON configuration files for all AI prompts used in the Working Backwards Assistant.

## File Structure

- `workingBackwards.json` - Working backwards questions and prompts
- `pressRelease.json` - Press release section generation prompts
- `faqs.json` - FAQ generation prompts
- `experiments.json` - Experiment suggestion prompts
- `initialThoughts.json` - Initial thoughts processing prompts

## Configuration Format

Each JSON file contains a map of prompt configurations with the following structure:

```json
{
  "prompt_id": {
    "id": "prompt_id",
    "description": "Description of what this prompt does",
    "defaults": {
      "provider": "openai",
      "model": "gpt-4",
      "temperature": 0.7
    },
    "template": "Prompt template with {{variable}} placeholders",
    "contextVariables": ["list", "of", "required", "variables"]
  }
}
```

### Fields

- `id`: Unique identifier for the prompt
- `description`: Human-readable description of the prompt's purpose
- `defaults`: Default AI model settings
  - `provider`: AI provider (e.g., "openai")
  - `model`: Model name
  - `temperature`: Temperature setting (0.0 - 1.0)
- `template`: The prompt template with variable placeholders
- `contextVariables`: List of required variables that must be provided

### Variable Substitution

Use `{{variableName}}` syntax in templates for variable substitution. All variables listed in `contextVariables` must be provided when using the prompt.

## Usage

```typescript
const promptLoader = PromptLoader.getInstance();
const prompt = await promptLoader.buildPrompt('category', 'prompt_id', {
  variables: {
    key1: 'value1',
    key2: 'value2'
  },
  overrides: {
    temperature: 0.8
  }
});
``` 