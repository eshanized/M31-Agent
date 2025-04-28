/**
 * Type definitions for API interactions
 */

import { Result } from './common';
import {
  CompletionParams,
  CompletionResponse,
  ChatCompletionParams,
  ChatCompletionResponse,
  TokenizeParams,
  TokenizeResponse,
  CodeGenerationParams,
  CodeExplanationParams,
  CommitMessageGenerationParams,
  LogGenerationParams
} from './ai';

export interface ApiRequestConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  retries?: number;
  retryDelay?: number;
  validateStatus?: (status: number) => boolean;
}

export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

// General API endpoints
export type CompletionRequest = CompletionParams;
export type CompletionResponseBody = Result<CompletionResponse, ApiErrorResponse>;

export type ChatCompletionRequest = ChatCompletionParams;
export type ChatCompletionResponseBody = Result<ChatCompletionResponse, ApiErrorResponse>;

export type TokenizeRequest = TokenizeParams;
export type TokenizeResponseBody = Result<TokenizeResponse, ApiErrorResponse>;

// M31 API specific endpoints
export interface AuthRequest {
  apiKey: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    plan: string;
  };
  limits?: {
    tokensPerMonth: number;
    tokensUsed: number;
    requestsPerDay: number;
    requestsUsed: number;
  };
  tokenExpiry: number;
}

export type AuthResponseBody = Result<AuthResponse, ApiErrorResponse>;

export interface ModelsListRequest {
  capability?: string;
}

export interface ModelsListResponse {
  models: {
    id: string;
    name: string;
    capabilities: string[];
    contextSize: number;
    provider: string;
  }[];
}

export type ModelsListResponseBody = Result<ModelsListResponse, ApiErrorResponse>;

export type CodeGenerationRequest = CodeGenerationParams;
export interface CodeGenerationResponse {
  code: string;
  language: string;
  tokens: number;
}
export type CodeGenerationResponseBody = Result<CodeGenerationResponse, ApiErrorResponse>;

export type CodeExplanationRequest = CodeExplanationParams;
export interface CodeExplanationResponse {
  explanation: string;
  tokens: number;
}
export type CodeExplanationResponseBody = Result<CodeExplanationResponse, ApiErrorResponse>;

export type CommitMessageGenerationRequest = CommitMessageGenerationParams;
export interface CommitMessageGenerationResponse {
  message: string;
  tokens: number;
}
export type CommitMessageGenerationResponseBody = Result<CommitMessageGenerationResponse, ApiErrorResponse>;

export type LogGenerationRequest = LogGenerationParams;
export interface LogGenerationResponse {
  code: string;
  tokens: number;
}
export type LogGenerationResponseBody = Result<LogGenerationResponse, ApiErrorResponse>;

export interface FeedbackRequest {
  type: 'positive' | 'negative' | 'report';
  prompt?: string;
  completion?: string;
  message?: string;
  sessionId?: string;
}

export interface FeedbackResponse {
  id: string;
  received: boolean;
}

export type FeedbackResponseBody = Result<FeedbackResponse, ApiErrorResponse>;

export interface UsageRequest {
  timeframe?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

export interface UsageResponse {
  tokens: {
    total: number;
    byModel: Record<string, number>;
    byDay: Record<string, number>;
  };
  requests: {
    total: number;
    byModel: Record<string, number>;
    byDay: Record<string, number>;
  };
}

export type UsageResponseBody = Result<UsageResponse, ApiErrorResponse>; 