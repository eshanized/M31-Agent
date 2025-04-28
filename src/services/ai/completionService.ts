import * as vscode from 'vscode';
import { ApiClient } from '../../api/apiClient';
import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';
import { TelemetryService } from '../telemetry/telemetryService';
import { CompletionRequest, CompletionResponse } from '../../types/api';
import { AIModelType } from '../../types/ai';
import { Result, Optional } from '../../types/common';
import { TelemetryEventType } from '../../types/telemetry';

/**
 * Service for handling code completions
 */
export class CompletionService {
  private static instance: CompletionService;
  private apiClient: ApiClient;
  private configManager: ConfigManager;
  private logger: Logger;
  private telemetryService: TelemetryService;
  private completionCache: Map<string, { result: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 60000; // 1 minute

  private constructor() {
    this.apiClient = ApiClient.getInstance();
    this.configManager = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
    this.telemetryService = TelemetryService.getInstance();
  }

  /**
   * Get the singleton instance of the CompletionService
   */
  public static getInstance(): CompletionService {
    if (!CompletionService.instance) {
      CompletionService.instance = new CompletionService();
    }
    return CompletionService.instance;
  }

  /**
   * Get a code completion
   */
  public async getCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    context?: string
  ): Promise<Optional<string>> {
    try {
      const startTime = Date.now();
      
      // Check if completions are enabled
      if (!this.configManager.isAutoCompleteEnabled()) {
        return undefined;
      }

      // Get the current line up to the cursor position
      const lineText = document.lineAt(position.line).text;
      const linePrefix = lineText.substring(0, position.character);
      
      // If the line is empty or just whitespace, no completion
      if (!linePrefix.trim()) {
        return undefined;
      }

      // Check the cache first
      const cacheKey = this.getCacheKey(document.languageId, linePrefix, context || '');
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.trackCompletionEvent(
          document.languageId,
          linePrefix.length,
          cached.length,
          position,
          Date.now() - startTime,
          true,
          true,
          0
        );
        return cached;
      }

      // Build the request
      const request = this.buildCompletionRequest(document, position, linePrefix, context);
      
      // Get the completion from the API
      const response = await this.apiClient.getCompletion(request);
      
      if (!response.success) {
        this.logger.error('Error getting completion', {
          error: response.error,
          document: document.fileName,
          position: `${position.line}:${position.character}`,
          linePrefix
        });
        return undefined;
      }

      const completionText = response.value.text;
      
      // Cache the result
      this.addToCache(cacheKey, completionText);
      
      // Track telemetry
      this.trackCompletionEvent(
        document.languageId,
        linePrefix.length,
        completionText.length,
        position,
        Date.now() - startTime,
        true,
        false,
        response.value.tokens
      );
      
      return completionText;
    } catch (error) {
      this.logger.error('Unexpected error in code completion', error, {
        document: document.fileName,
        position: `${position.line}:${position.character}`
      });
      
      return undefined;
    }
  }

  /**
   * Build a completion request
   */
  private buildCompletionRequest(
    document: vscode.TextDocument,
    position: vscode.Position,
    linePrefix: string,
    context?: string
  ): CompletionRequest {
    // Get a few lines before and after for context
    const settings = this.configManager.getAllSettings();
    const linesToContextBefore = settings.codeCompletion.linesToContextBefore;
    const linesToContextAfter = settings.codeCompletion.linesToContextAfter;
    
    // Calculate the start and end lines for context
    const startLine = Math.max(0, position.line - linesToContextBefore);
    const endLine = Math.min(document.lineCount - 1, position.line + linesToContextAfter);
    
    // Get the text before the cursor
    let promptText = '';
    for (let i = startLine; i < position.line; i++) {
      promptText += document.lineAt(i).text + '\n';
    }
    promptText += linePrefix;
    
    // Get the text after the cursor for additional context
    let contextAfter = '';
    for (let i = position.line; i <= endLine; i++) {
      if (i === position.line) {
        // For the current line, only include text after the cursor
        contextAfter += document.lineAt(i).text.substring(position.character) + '\n';
      } else {
        contextAfter += document.lineAt(i).text + '\n';
      }
    }
    
    // Add file-type specific context if available
    if (context) {
      promptText = `${context}\n\n${promptText}`;
    }
    
    return {
      prompt: promptText,
      model: this.configManager.getModel(),
      maxTokens: settings.codeGeneration.maxTokens,
      temperature: settings.codeGeneration.temperature,
      stop: ['\n\n', '```']
    };
  }

  /**
   * Get a completion from the cache
   */
  private getFromCache(key: string): string | undefined {
    const cached = this.completionCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.result;
    }
    
    if (cached) {
      // Remove expired cache entry
      this.completionCache.delete(key);
    }
    
    return undefined;
  }

  /**
   * Add a completion to the cache
   */
  private addToCache(key: string, result: string): void {
    this.completionCache.set(key, {
      result,
      timestamp: Date.now()
    });
    
    // Clean up cache if it gets too large (more than 100 entries)
    if (this.completionCache.size > 100) {
      const keysToDelete = [...this.completionCache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 20)
        .map(([key]) => key);
      
      keysToDelete.forEach(key => this.completionCache.delete(key));
    }
  }

  /**
   * Get a cache key for a completion
   */
  private getCacheKey(language: string, prefix: string, context: string): string {
    return `${language}:${prefix}:${context.substring(0, 50)}`;
  }

  /**
   * Track a completion event
   */
  private trackCompletionEvent(
    language: string,
    promptLength: number,
    completionLength: number,
    position: vscode.Position,
    duration: number,
    success: boolean,
    fromCache: boolean,
    tokensUsed: number
  ): void {
    this.telemetryService.trackEvent({
      type: TelemetryEventType.CODE_COMPLETED,
      timestamp: Date.now(),
      sessionId: this.apiClient.getSessionId(),
      properties: {
        language,
        promptLength,
        completionLength,
        position: {
          line: position.line,
          character: position.character
        },
        success,
        fromCache,
        modelId: this.configManager.getModel()
      },
      measurements: {
        duration,
        promptLength,
        completionLength,
        tokensUsed
      }
    });
  }
} 