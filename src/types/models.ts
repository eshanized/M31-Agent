/**
 * Type definitions for data models
 */

import { AICapability, AIModelType } from './ai';
import { ID, WithId, WithTimestamp } from './common';

export interface User {
  id: ID;
  username: string;
  email: string;
  apiKey?: string;
  preferences: UserPreferences;
  subscription: SubscriptionInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  telemetryEnabled: boolean;
  defaultModel: string;
  fontSize: number;
  tabSize: number;
  autoSave: boolean;
  formatOnSave: boolean;
  autoComplete: boolean;
  language: string;
}

export interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  expiresAt?: Date;
  features: Feature[];
  limits: UsageLimits;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  capability: AICapability;
}

export interface UsageLimits {
  tokens: {
    limit: number;
    used: number;
    resetsAt: Date;
  };
  requests: {
    limit: number;
    used: number;
    resetsAt: Date;
  };
  models: AIModelType[];
}

export interface Project {
  id: ID;
  name: string;
  description?: string;
  language: string;
  framework?: string;
  repositoryUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
  collaborators: Collaborator[];
}

export interface ProjectSettings {
  contextStrategy: 'workspace' | 'repository' | 'openFiles' | 'selectedFiles';
  selectedFiles: string[];
  excludedPaths: string[];
  defaultBranch: string;
  customPrompts: CustomPrompt[];
}

export interface CustomPrompt {
  id: ID;
  name: string;
  prompt: string;
  shortcut?: string;
  language?: string;
  category: 'code' | 'documentation' | 'testing' | 'other';
}

export interface Collaborator {
  id: ID;
  username: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface CodeSnippet extends WithId<WithTimestamp<{}>> {
  title: string;
  code: string;
  language: string;
  description?: string;
  tags: string[];
  favorite: boolean;
  projectId?: ID;
}

export interface CodeSession extends WithId<WithTimestamp<{}>> {
  userId: ID;
  modelId: string;
  interactions: CodeInteraction[];
  duration: number;
  tokensUsed: number;
}

export interface CodeInteraction {
  type: 'prompt' | 'completion' | 'refinement';
  content: string;
  timestamp: Date;
  tokensUsed: number;
}

export interface UsageStatistics {
  tokens: {
    total: number;
    byModel: Record<string, number>;
    byCapability: Partial<Record<AICapability, number>>;
    byDay: Record<string, number>;
  };
  requests: {
    total: number;
    byModel: Record<string, number>;
    byCapability: Partial<Record<AICapability, number>>;
    byDay: Record<string, number>;
  };
  sessions: {
    total: number;
    averageDuration: number;
    byDay: Record<string, number>;
  };
}

export interface GitDiff {
  path: string;
  hunks: GitHunk[];
  stats: {
    additions: number;
    deletions: number;
    changes: number;
  };
}

export interface GitHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface LogEntry {
  message: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  timestamp: Date;
  context?: Record<string, any>;
}

export interface Feedback {
  id: ID;
  userId: ID;
  sessionId: ID;
  type: 'thumbsUp' | 'thumbsDown' | 'report';
  content?: string;
  prompt?: string;
  completion?: string;
  createdAt: Date;
}

export interface Notification {
  id: ID;
  userId: ID;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface ApiKeyInfo {
  id: ID;
  name: string;
  key: string;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  scopes: string[];
} 