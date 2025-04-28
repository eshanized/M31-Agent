/**
 * Type definitions for telemetry data collection
 */

import { AICapability } from './ai';

export enum TelemetryEventType {
  EXTENSION_ACTIVATED = 'extension_activated',
  EXTENSION_DEACTIVATED = 'extension_deactivated',
  COMMAND_EXECUTED = 'command_executed',
  FEATURE_USED = 'feature_used',
  CODE_GENERATED = 'code_generated',
  CODE_EXPLAINED = 'code_explained',
  COMMIT_GENERATED = 'commit_generated',
  LOGS_ADDED = 'logs_added',
  CODE_COMPLETED = 'code_completed',
  CHAT_MESSAGE_SENT = 'chat_message_sent',
  CHAT_MESSAGE_RECEIVED = 'chat_message_received',
  ERROR_OCCURRED = 'error_occurred',
  MODEL_CHANGED = 'model_changed',
  SETTINGS_CHANGED = 'settings_changed',
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  SUGGESTION_ACCEPTED = 'suggestion_accepted',
  SUGGESTION_REJECTED = 'suggestion_rejected',
  FEEDBACK_SUBMITTED = 'feedback_submitted',
  PERFORMANCE_METRIC = 'performance_metric'
}

export interface TelemetryEvent {
  type: TelemetryEventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  properties?: Record<string, any>;
  measurements?: Record<string, number>;
}

export interface ActivationEvent {
  vscodeVersion: string;
  extensionVersion: string;
  platform: string;
  machineId: string;
  sessionId: string;
  isNewInstall: boolean;
}

export interface CommandEvent {
  command: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
}

export interface FeatureUsageEvent {
  feature: AICapability;
  modelId: string;
  duration: number;
  success: boolean;
  fileType?: string;
  fileSize?: number;
  errorMessage?: string;
}

export interface CodeGenerationEvent {
  modelId: string;
  language: string;
  promptLength: number;
  responseLength: number;
  duration: number;
  success: boolean;
  tokensUsed: number;
}

export interface CodeExplanationEvent {
  modelId: string;
  language: string;
  codeLength: number;
  explanationLength: number;
  duration: number;
  success: boolean;
  tokensUsed: number;
}

export interface CommitGenerationEvent {
  modelId: string;
  diffSize: number;
  messageLength: number;
  duration: number;
  success: boolean;
  tokensUsed: number;
}

export interface LogGenerationEvent {
  modelId: string;
  language: string;
  codeLength: number;
  addedLogsCount: number;
  duration: number;
  success: boolean;
  tokensUsed: number;
}

export interface CodeCompletionEvent {
  modelId: string;
  language: string;
  promptLength: number;
  completionLength: number;
  position: {
    line: number;
    character: number;
  };
  duration: number;
  accepted: boolean;
  tokensUsed: number;
}

export interface ChatEvent {
  modelId: string;
  messageType: 'sent' | 'received';
  messageLength: number;
  duration?: number;
  success?: boolean;
  tokensUsed?: number;
}

export interface ErrorEvent {
  errorName: string;
  errorMessage: string;
  errorStack?: string;
  componentName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ModelChangedEvent {
  previousModel: string;
  newModel: string;
  capability?: AICapability;
}

export interface SettingsChangedEvent {
  setting: string;
  previousValue?: any;
  newValue?: any;
}

export interface ApiEvent {
  endpoint: string;
  method: string;
  statusCode?: number;
  duration: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  requestSize?: number;
  responseSize?: number;
}

export interface SuggestionEvent {
  type: 'accepted' | 'rejected';
  feature: AICapability;
  modelId: string;
  suggestionLength: number;
  duration: number;
  position?: {
    line: number;
    character: number;
  };
}

export interface FeedbackEvent {
  feature: AICapability;
  rating: 'positive' | 'negative' | 'neutral';
  comment?: string;
  sessionId: string;
  modelId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  component: string;
}

export interface TelemetryService {
  trackEvent(event: TelemetryEvent): void;
  trackException(error: Error, componentName: string, severity: string): void;
  trackMetric(name: string, value: number): void;
  flush(): Promise<void>;
  disable(): void;
  enable(): void;
  isEnabled(): boolean;
} 