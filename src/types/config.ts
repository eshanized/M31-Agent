/**
 * Type definitions for extension configuration
 */

import { AICapability, AIModel } from './ai';
import { Dict } from './common';

export interface Configuration {
  defaultFeatures: DefaultFeatures;
  defaultModels: DefaultModels;
  api: ApiConfiguration;
  resources: ResourceConfiguration;
  contextStrategies: ContextStrategy[];
  customizations: Customizations;
  defaults: DefaultValues;
  prompts: Dict<string>;
  languages: LanguageSupport[];
  diagnostics: DiagnosticSettings;
}

export interface DefaultFeatures {
  codeCompletion: boolean;
  codeGeneration: boolean;
  codeExplanation: boolean;
  commitGeneration: boolean;
  chatAssistant: boolean;
  logGeneration: boolean;
  diagnostics: boolean;
  refactoring: boolean;
  testing: boolean;
  documentation: boolean;
}

export interface DefaultModels {
  codeCompletion: string;
  codeGeneration: string;
  codeExplanation: string;
  commitGeneration: string;
  chatAssistant: string;
  logGeneration: string;
  diagnostics: string;
  refactoring: string;
  testing: string;
  documentation: string;
}

export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  headers: Dict<string>;
  endpoints: ApiEndpoints;
}

export interface ApiEndpoints {
  auth: string;
  models: string;
  completion: string;
  chat: string;
  tokenize: string;
  codeGeneration: string;
  codeExplanation: string;
  commitGeneration: string;
  logGeneration: string;
  feedback: string;
  usage: string;
}

export interface ResourceConfiguration {
  maxLogEntries: number;
  maxChatHistory: number;
  maxQueueSize: number;
  maxCacheSize: number;
  maxFileSize: number;
  throttleRate: number;
  tokenBudget: number;
  debounceDelay: number;
  cacheExpiry: number;
  refreshInterval: number;
}

export interface ContextStrategy {
  id: string;
  name: string;
  description: string;
  getContext: string; // Function name to be called
  maxFiles: number;
  maxTokens: number;
  priority: number;
}

export interface Customizations {
  themes: Dict<ThemeConfiguration>;
  icons: Dict<string>;
  statusBarMessages: string[];
  welcomeMessages: string[];
  snippets: Dict<CodeSnippet>;
}

export interface ThemeConfiguration {
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  hover: string;
}

export interface CodeSnippet {
  name: string;
  description: string;
  code: string;
  language: string;
}

export interface DefaultValues {
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  maxTokens: number;
  model: string;
  timeout: number;
  retries: number;
  contextSize: number;
  language: string;
}

export interface LanguageSupport {
  id: string;
  name: string;
  extensions: string[];
  autoCompletionTriggers: string[];
  commentStart: string;
  commentEnd?: string;
  lineComment: string;
  indentationRules: {
    increaseIndentPattern: string;
    decreaseIndentPattern: string;
  };
  capabilities: AICapability[];
  templates: {
    function: string;
    class: string;
    comment: string;
    test: string;
  };
}

export interface DiagnosticSettings {
  enabled: boolean;
  maxProblems: number;
  delayMs: number;
  severities: {
    error: string[];
    warning: string[];
    info: string[];
    hint: string[];
  };
} 