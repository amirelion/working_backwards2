export interface PromptDefaults {
  provider: string;
  model: string;
  temperature: number;
}

export interface PromptConfig {
  id: string;
  description: string;
  defaults: PromptDefaults;
  template: string;
  contextVariables: string[];
}

export interface PromptCategory {
  [key: string]: PromptConfig | { [subKey: string]: PromptConfig };
}

export interface PromptError extends Error {
  code: 'MISSING_CONFIG' | 'MISSING_VARIABLES' | 'INVALID_CONFIG' | 'LOAD_ERROR';
  details?: Record<string, unknown>;
}

export interface PromptContext {
  variables: Record<string, string | number | boolean>;
  overrides?: Partial<PromptDefaults>;
} 