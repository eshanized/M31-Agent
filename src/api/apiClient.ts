import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';
import {
  ApiRequestConfig,
  ApiErrorResponse,
  AuthRequest,
  AuthResponse,
  AuthResponseBody,
  ModelsListRequest,
  ModelsListResponse,
  ModelsListResponseBody,
  CompletionRequest,
  CompletionResponseBody,
  ChatCompletionRequest,
  ChatCompletionResponseBody,
  CodeGenerationRequest,
  CodeGenerationResponseBody,
  CodeExplanationRequest,
  CodeExplanationResponseBody,
  CommitMessageGenerationRequest,
  CommitMessageGenerationResponseBody,
  LogGenerationRequest,
  LogGenerationResponseBody,
  FeedbackRequest,
  FeedbackResponseBody,
  UsageRequest,
  UsageResponseBody
} from '../types/api';
import { Result, Success, Failure } from '../types/common';

/**
 * API Client for communicating with the M31-Agents backend services
 */
export class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;
  private configManager: ConfigManager;
  private logger: Logger;
  private baseURL: string = 'https://api.m31-agents.io/v1';
  private sessionId: string;

  private constructor() {
    this.configManager = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
    this.sessionId = uuidv4();

    // Create Axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-M31-Session-ID': this.sessionId,
        'X-M31-Client-Version': this.getExtensionVersion()
      }
    });

    // Add request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = this.configManager.getApiKey();
        if (apiKey) {
          config.headers['Authorization'] = `Bearer ${apiKey}`;
        }
        return config;
      },
      (error) => {
        this.logger.error('API request error', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('API response', {
          url: response.config.url,
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error: AxiosError) => {
        this.logger.error('API response error', error, {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the singleton instance of the ApiClient
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Set the base URL for API requests
   */
  public setBaseURL(url: string): void {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  /**
   * Get the current session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Create a new session ID
   */
  public createNewSession(): string {
    this.sessionId = uuidv4();
    this.client.defaults.headers['X-M31-Session-ID'] = this.sessionId;
    return this.sessionId;
  }

  /**
   * Authenticate with the API using an API key
   */
  public async authenticate(apiKey: string): Promise<Result<AuthResponse, ApiErrorResponse>> {
    try {
      const request: AuthRequest = { apiKey };
      const response = await this.client.post<AuthResponseBody>('/auth', request);
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Get the list of available models
   */
  public async getModels(request?: ModelsListRequest): Promise<Result<ModelsListResponse, ApiErrorResponse>> {
    try {
      const response = await this.client.get<ModelsListResponseBody>('/models', { params: request });
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Get a text completion from the API
   */
  public async getCompletion(request: CompletionRequest): Promise<Result<any, ApiErrorResponse>> {
    try {
      const response = await this.client.post<CompletionResponseBody>('/completions', request);
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Get a chat completion from the API
   */
  public async getChatCompletion(request: ChatCompletionRequest): Promise<Result<any, ApiErrorResponse>> {
    try {
      const response = await this.client.post<ChatCompletionResponseBody>('/chat/completions', request);
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Generate code from a prompt
   */
  public async generateCode(request: CodeGenerationRequest): Promise<Result<any, ApiErrorResponse>> {
    try {
      const response = await this.client.post<CodeGenerationResponseBody>('/code/generate', request);
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Get an explanation for a code snippet
   */
  public async explainCode(request: CodeExplanationRequest): Promise<Result<any, ApiErrorResponse>> {
    try {
      const response = await this.client.post<CodeExplanationResponseBody>('/code/explain', request);
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Generate a commit message from a diff
   */
  public async generateCommitMessage(request: CommitMessageGenerationRequest): Promise<Result<any, ApiErrorResponse>> {
    try {
      const response = await this.client.post<CommitMessageGenerationResponseBody>('/code/commit-message', request);
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Add logging to code
   */
  public async addLogging(request: LogGenerationRequest): Promise<Result<any, ApiErrorResponse>> {
    try {
      const response = await this.client.post<LogGenerationResponseBody>('/code/add-logging', request);
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Submit feedback for the service
   */
  public async submitFeedback(request: FeedbackRequest): Promise<Result<any, ApiErrorResponse>> {
    try {
      const response = await this.client.post<FeedbackResponseBody>('/feedback', request);
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Get usage statistics
   */
  public async getUsage(request?: UsageRequest): Promise<Result<any, ApiErrorResponse>> {
    try {
      const response = await this.client.get<UsageResponseBody>('/usage', { params: request });
      
      if (response.data.success) {
        return { success: true, value: response.data.value };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Make a generic GET request to the API
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T, ApiErrorResponse>> {
    try {
      const response = await this.client.get<Result<T, ApiErrorResponse>>(url, config);
      
      if ('success' in response.data && response.data.success) {
        return { success: true, value: (response.data as Success<T>).value };
      } else if ('success' in response.data && !response.data.success) {
        return { success: false, error: (response.data as Failure<ApiErrorResponse>).error };
      } else {
        return { success: true, value: response.data as T };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Make a generic POST request to the API
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T, ApiErrorResponse>> {
    try {
      const response = await this.client.post<Result<T, ApiErrorResponse>>(url, data, config);
      
      if ('success' in response.data && response.data.success) {
        return { success: true, value: (response.data as Success<T>).value };
      } else if ('success' in response.data && !response.data.success) {
        return { success: false, error: (response.data as Failure<ApiErrorResponse>).error };
      } else {
        return { success: true, value: response.data as T };
      }
    } catch (error) {
      return this.handleAxiosError(error as AxiosError);
    }
  }

  /**
   * Get the extension version
   */
  private getExtensionVersion(): string {
    try {
      // This would typically come from the package.json
      return '0.1.0';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Handle Axios errors and convert them to ApiErrorResponse
   */
  private handleAxiosError<T>(error: AxiosError): Result<T, ApiErrorResponse> {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorResponse: ApiErrorResponse = {
        status: error.response.status,
        code: 'API_ERROR',
        message: 'An error occurred while communicating with the API',
        details: error.response.data
      };
      return { success: false, error: errorResponse };
    } else if (error.request) {
      // The request was made but no response was received
      const errorResponse: ApiErrorResponse = {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'No response received from the server',
        details: error.request
      };
      return { success: false, error: errorResponse };
    } else {
      // Something happened in setting up the request that triggered an Error
      const errorResponse: ApiErrorResponse = {
        status: 0,
        code: 'REQUEST_SETUP_ERROR',
        message: error.message || 'Error setting up the request',
        details: error
      };
      return { success: false, error: errorResponse };
    }
  }
} 