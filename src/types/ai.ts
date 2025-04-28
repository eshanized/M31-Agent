/**
 * Type definitions for AI-related functionality
 */

import { Dict } from './common';

export enum AIModelType {
  STANDARD = 'standard',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum AIModelProvider {
  M31 = 'm31',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  HUGGINGFACE = 'huggingface',
  COHERE = 'cohere',
  CUSTOM = 'custom'
}

export enum AICapability {
  CODE_COMPLETION = 'code_completion',
  CODE_GENERATION = 'code_generation',
  CODE_EXPLANATION = 'code_explanation',
  COMMIT_GENERATION = 'commit_generation',
  LOG_GENERATION = 'log_generation',
  CHAT = 'chat',
  DEBUGGING = 'debugging',
  REFACTORING = 'refactoring',
  TRANSLATION = 'translation'
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIModelProvider;
  type: AIModelType;
  capabilities: AICapability[];
  contextSize: number;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stop?: string[];
  description: string;
  isDefault?: boolean;
  isCustom?: boolean;
  apiKey?: string;
  endpoint?: string;
}

export interface CompletionParams {
  prompt: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface CompletionResponse {
  text: string;
  tokens: number;
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter';
}

export interface ChatMessageRole {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export interface ChatCompletionParams {
  messages: ChatMessageRole[];
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface ChatCompletionResponse {
  message: ChatMessageRole;
  tokens: number;
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter';
}

export interface TokenizeParams {
  text: string;
  model: string;
}

export interface TokenizeResponse {
  tokens: number;
}

export interface AIServiceConfig {
  apiKey: string;
  defaultModel: string;
  models: AIModel[];
  baseUrl?: string;
  timeout?: number;
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

export interface CodeAnalysisResult {
  language: string;
  imports: string[];
  functions: {
    name: string;
    params: string[];
    returnType?: string;
    complexity: number;
    loc: number;
    description?: string;
  }[];
  classes: {
    name: string;
    methods: string[];
    properties: string[];
    extends?: string;
    implements?: string[];
  }[];
  complexity: number;
  loc: number;
  issues: {
    type: 'error' | 'warning' | 'info';
    message: string;
    line: number;
    column: number;
  }[];
  dependencies: Dict<string>;
}

export interface CodeGenerationParams {
  prompt: string;
  language?: string;
  modelId?: string;
  includeComments?: boolean;
  maxTokens?: number;
}

export interface CodeExplanationParams {
  code: string;
  language?: string;
  modelId?: string;
  level?: 'basic' | 'intermediate' | 'detailed';
  includeExamples?: boolean;
}

export interface CommitMessageGenerationParams {
  diff: string;
  conventional?: boolean;
  scope?: string;
  modelId?: string;
}

export interface LogGenerationParams {
  code: string;
  language: string;
  level?: 'basic' | 'detailed';
  logFormat?: string;
  logLibrary?: string;
}

export type PromptTemplate = string | ((params: Dict) => string); 