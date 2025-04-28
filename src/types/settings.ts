/**
 * Type definitions for extension settings
 */

import { AICapability, AIModelType } from './ai';

export interface M31Settings {
  apiKey: string;
  model: AIModelType;
  autoComplete: boolean;
  telemetry: boolean;
  useChat: boolean;
  advanced: AdvancedSettings;
  codeGeneration: CodeGenerationSettings;
  codeCompletion: CodeCompletionSettings;
  contextCollection: ContextCollectionSettings;
  keyBindings: KeyBindingSettings;
  formatting: FormattingSettings;
  customModels: CustomModelSettings[];
  customPrompts: CustomPromptSettings[];
  languages: LanguageSpecificSettings;
  themePalette: ThemePaletteSettings;
}

export interface AdvancedSettings {
  debug: boolean;
  logLevel: 'info' | 'warn' | 'error' | 'debug';
  proxyUrl?: string;
  timeout: number;
  retries: number;
  useCache: boolean;
  cacheTTL: number;
  workspaceTrust: boolean;
  experimental: boolean;
}

export interface CodeGenerationSettings {
  includeComments: boolean;
  language?: string;
  maxTokens: number;
  temperature: number;
  templateFile?: string;
  includeTests: boolean;
  testFramework?: string;
  useTypeInference: boolean;
}

export interface CodeCompletionSettings {
  enabled: boolean;
  triggerCharacters: string[];
  minWordLength: number;
  maxSuggestions: number;
  debounceTime: number;
  experimentalMultilineCompletion: boolean;
  linesToContextBefore: number;
  linesToContextAfter: number;
  tabToAccept: boolean;
  languages: Record<string, boolean>;
}

export interface ContextCollectionSettings {
  strategy: 'workspace' | 'openFiles' | 'selectedFiles' | 'gitRepository';
  maxFiles: number;
  maxFileSizeKb: number;
  excludePatterns: string[];
  includePatterns: string[];
  collectDependencies: boolean;
  preferCurrentFile: boolean;
  includeSelection: boolean;
  treatAsContext: {
    imports: boolean;
    types: boolean;
    docs: boolean;
    tests: boolean;
  };
  languageSpecific: Record<string, boolean>;
}

export interface KeyBindingSettings {
  generateCode: string;
  explainCode: string;
  generateCommit: string;
  addLogs: string;
  formatCode: string;
  toggleChat: string;
  acceptSuggestion: string;
  dismissSuggestion: string;
}

export interface FormattingSettings {
  formatter: 'prettier' | 'default' | 'custom';
  formatOnSave: boolean;
  formatOnPaste: boolean;
  formatOnType: boolean;
  indentSize: number;
  tabSize: number;
  insertSpaces: boolean;
  bracketSpacing: boolean;
  singleQuote: boolean;
  trailingComma: 'none' | 'es5' | 'all';
  semicolons: boolean;
  printWidth: number;
}

export interface CustomModelSettings {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  apiKey?: string;
  capabilities: AICapability[];
  contextLength: number;
  maxTokens: number;
  isDefault: boolean;
}

export interface CustomPromptSettings {
  id: string;
  name: string;
  prompt: string;
  description: string;
  tags: string[];
  language?: string;
  capability: AICapability;
  shortcut?: string;
}

export interface LanguageSpecificSettings {
  languages: {
    javascript: LanguageSettings;
    typescript: LanguageSettings;
    python: LanguageSettings;
    java: LanguageSettings;
    csharp: LanguageSettings;
    cpp: LanguageSettings;
    go: LanguageSettings;
    rust: LanguageSettings;
    ruby: LanguageSettings;
    php: LanguageSettings;
    html: LanguageSettings;
    css: LanguageSettings;
    [key: string]: LanguageSettings;
  };
}

export interface LanguageSettings {
  enabled: boolean;
  model?: string;
  autoComplete: boolean;
  customPrompts: CustomPromptSettings[];
  contextRelevance: {
    importWeight: number;
    typeWeight: number;
    functionWeight: number;
    commentWeight: number;
  };
  suggestImports: boolean;
  suggestTests: boolean;
  useTypeInference: boolean;
}

export interface ThemePaletteSettings {
  suggestionBackground: string;
  suggestionForeground: string;
  suggestionSelectedBackground: string;
  suggestionSelectedForeground: string;
  suggestionBorder: string;
  chatBackground: string;
  chatForeground: string;
  chatUserMessageBackground: string;
  chatUserMessageForeground: string;
  chatAssistantMessageBackground: string;
  chatAssistantMessageForeground: string;
  iconColor: string;
} 