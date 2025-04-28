import * as vscode from 'vscode';
import { ApiClient } from '../../api/apiClient';
import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';
import { TelemetryService } from '../telemetry/telemetryService';
import { CompletionService } from './completionService';
import { 
  AICapability, 
  AIModelType,
  CodeGenerationParams,
  CodeExplanationParams,
  CommitMessageGenerationParams,
  LogGenerationParams
} from '../../types/ai';
import { Optional, Result } from '../../types/common';
import { TelemetryEventType } from '../../types/telemetry';

/**
 * Main AI Agent service that orchestrates all AI capabilities
 */
export class AgentService implements vscode.Disposable {
  private static instance: AgentService;
  private apiClient: ApiClient;
  private configManager: ConfigManager;
  private logger: Logger;
  private telemetryService: TelemetryService;
  private completionService: CompletionService;
  private context: vscode.ExtensionContext;
  private disposables: vscode.Disposable[] = [];
  private selectedModel: AIModelType;
  private activeSessions: Map<string, { startTime: number; capability: AICapability }> = new Map();

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.apiClient = ApiClient.getInstance();
    this.configManager = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
    this.telemetryService = TelemetryService.getInstance();
    this.completionService = CompletionService.getInstance();
    this.selectedModel = this.configManager.getModel();

    // Listen for configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('m31-agents.model')) {
          const previousModel = this.selectedModel;
          this.selectedModel = this.configManager.getModel();
          
          this.logger.info(`Model changed from ${previousModel} to ${this.selectedModel}`);
          
          // Track model change in telemetry
          this.telemetryService.trackEvent({
            type: TelemetryEventType.MODEL_CHANGED,
            timestamp: Date.now(),
            sessionId: this.apiClient.getSessionId(),
            properties: {
              previousModel,
              newModel: this.selectedModel
            }
          });
        }
      })
    );
  }

  /**
   * Get the singleton instance of the AgentService
   */
  public static getInstance(context: vscode.ExtensionContext): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService(context);
    }
    return AgentService.instance;
  }

  /**
   * Get the currently selected model
   */
  public getModel(): AIModelType {
    return this.selectedModel;
  }

  /**
   * Set the model to use for AI capabilities
   */
  public async setModel(model: AIModelType): Promise<void> {
    if (model !== this.selectedModel) {
      this.logger.info(`Setting model to ${model}`);
      await this.configManager.setModel(model);
      this.selectedModel = model;
    }
  }

  /**
   * Get a code completion
   */
  public async getCodeCompletion(
    document: vscode.TextDocument, 
    position: vscode.Position, 
    context?: string
  ): Promise<Optional<string>> {
    const sessionId = this.startSession(AICapability.CODE_COMPLETION);
    
    try {
      const result = await this.completionService.getCompletion(document, position, context);
      this.endSession(sessionId, AICapability.CODE_COMPLETION, true);
      return result;
    } catch (error) {
      this.logger.error('Error in code completion', error);
      this.endSession(sessionId, AICapability.CODE_COMPLETION, false);
      return undefined;
    }
  }

  /**
   * Generate code based on a prompt
   */
  public async generateCode(params: CodeGenerationParams): Promise<Result<string, Error>> {
    const sessionId = this.startSession(AICapability.CODE_GENERATION);
    
    try {
      this.logger.info('Generating code', { prompt: params.prompt?.substring(0, 100) });
      
      // Prepare request
      const request = {
        ...params,
        modelId: params.modelId || this.selectedModel
      };
      
      // Call API
      const response = await this.apiClient.generateCode(request);
      
      if (!response.success) {
        const error = new Error(`Failed to generate code: ${response.error.message}`);
        this.endSession(sessionId, AICapability.CODE_GENERATION, false);
        return { success: false, error };
      }
      
      this.endSession(sessionId, AICapability.CODE_GENERATION, true);
      return { success: true, value: response.value.code };
    } catch (error) {
      this.logger.error('Error generating code', error);
      this.endSession(sessionId, AICapability.CODE_GENERATION, false);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Explain code
   */
  public async explainCode(params: CodeExplanationParams): Promise<Result<string, Error>> {
    const sessionId = this.startSession(AICapability.CODE_EXPLANATION);
    
    try {
      this.logger.info('Explaining code', { 
        codeLength: params.code?.length,
        language: params.language
      });
      
      // Prepare request
      const request = {
        ...params,
        modelId: params.modelId || this.selectedModel
      };
      
      // Call API
      const response = await this.apiClient.explainCode(request);
      
      if (!response.success) {
        const error = new Error(`Failed to explain code: ${response.error.message}`);
        this.endSession(sessionId, AICapability.CODE_EXPLANATION, false);
        return { success: false, error };
      }
      
      this.endSession(sessionId, AICapability.CODE_EXPLANATION, true);
      return { success: true, value: response.value.explanation };
    } catch (error) {
      this.logger.error('Error explaining code', error);
      this.endSession(sessionId, AICapability.CODE_EXPLANATION, false);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Generate a commit message
   */
  public async generateCommitMessage(params: CommitMessageGenerationParams): Promise<Result<string, Error>> {
    const sessionId = this.startSession(AICapability.COMMIT_GENERATION);
    
    try {
      this.logger.info('Generating commit message', { 
        diffSize: params.diff?.length
      });
      
      // Prepare request
      const request = {
        ...params,
        modelId: params.modelId || this.selectedModel
      };
      
      // Call API
      const response = await this.apiClient.generateCommitMessage(request);
      
      if (!response.success) {
        const error = new Error(`Failed to generate commit message: ${response.error.message}`);
        this.endSession(sessionId, AICapability.COMMIT_GENERATION, false);
        return { success: false, error };
      }
      
      this.endSession(sessionId, AICapability.COMMIT_GENERATION, true);
      return { success: true, value: response.value.message };
    } catch (error) {
      this.logger.error('Error generating commit message', error);
      this.endSession(sessionId, AICapability.COMMIT_GENERATION, false);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Add logging to code
   */
  public async addLogging(params: LogGenerationParams): Promise<Result<string, Error>> {
    const sessionId = this.startSession(AICapability.LOG_GENERATION);
    
    try {
      this.logger.info('Adding logs to code', { 
        codeLength: params.code?.length,
        language: params.language
      });
      
      // Prepare request
      const request = {
        ...params,
        modelId: params.modelId || this.selectedModel
      };
      
      // Call API
      const response = await this.apiClient.addLogging(request);
      
      if (!response.success) {
        const error = new Error(`Failed to add logging: ${response.error.message}`);
        this.endSession(sessionId, AICapability.LOG_GENERATION, false);
        return { success: false, error };
      }
      
      this.endSession(sessionId, AICapability.LOG_GENERATION, true);
      return { success: true, value: response.value.code };
    } catch (error) {
      this.logger.error('Error adding logs', error);
      this.endSession(sessionId, AICapability.LOG_GENERATION, false);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Chat with the AI assistant
   */
  public async chat(message: string, conversation: string[] = []): Promise<Result<string, Error>> {
    const sessionId = this.startSession(AICapability.CHAT);
    
    try {
      this.logger.info('Sending chat message', { 
        messageLength: message.length,
        conversationLength: conversation.length
      });
      
      // Build chat messages
      const messages = [
        { role: 'system', content: 'You are M31-Agent, an AI assistant for developers.' },
        ...conversation.map((content, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content
        })),
        { role: 'user', content: message }
      ];
      
      // Call API
      const response = await this.apiClient.getChatCompletion({
        messages,
        model: this.selectedModel
      });
      
      if (!response.success) {
        const error = new Error(`Failed to get chat response: ${response.error.message}`);
        this.endSession(sessionId, AICapability.CHAT, false);
        return { success: false, error };
      }
      
      this.endSession(sessionId, AICapability.CHAT, true);
      return { success: true, value: response.value.message.content };
    } catch (error) {
      this.logger.error('Error in chat', error);
      this.endSession(sessionId, AICapability.CHAT, false);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Start a session for a capability
   */
  private startSession(capability: AICapability): string {
    const sessionId = `${capability}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.activeSessions.set(sessionId, {
      startTime: Date.now(),
      capability
    });
    
    return sessionId;
  }

  /**
   * End a session for a capability
   */
  private endSession(sessionId: string, capability: AICapability, success: boolean): void {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return;
    }
    
    const duration = Date.now() - session.startTime;
    
    // Track feature usage
    this.telemetryService.trackEvent({
      type: TelemetryEventType.FEATURE_USED,
      timestamp: Date.now(),
      sessionId: this.apiClient.getSessionId(),
      properties: {
        feature: capability,
        modelId: this.selectedModel,
        success
      },
      measurements: {
        duration
      }
    });
    
    this.activeSessions.delete(sessionId);
  }

  /**
   * Dispose the service and its resources
   */
  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
} 