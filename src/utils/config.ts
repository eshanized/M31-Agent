import * as vscode from 'vscode';
import { AIModelType } from '../types/ai';
import { M31Settings } from '../types/settings';
import { Logger } from './logger';

/**
 * Configuration manager for the M31-Agents extension
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private readonly configSection = 'm31-agents';
  private readonly logger = Logger.getInstance();
  private defaultSettings: M31Settings;

  private constructor() {
    this.defaultSettings = this.getDefaultSettings();
  }

  /**
   * Get the singleton instance of the ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get the extension configuration
   */
  public getConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(this.configSection);
  }

  /**
   * Get a specific configuration value
   * @param key The configuration key
   * @param defaultValue The default value to return if the key is not found
   */
  public get<T>(key: string, defaultValue?: T): T {
    const config = this.getConfig();
    return config.get<T>(key, defaultValue as T);
  }

  /**
   * Update a configuration value
   * @param key The configuration key
   * @param value The new value
   * @param target The configuration target (global or workspace)
   */
  public async update(key: string, value: any, target = vscode.ConfigurationTarget.Global): Promise<void> {
    const config = this.getConfig();
    await config.update(key, value, target);
    this.logger.info(`Updated configuration: ${key} = ${JSON.stringify(value)}`);
  }

  /**
   * Get the API key from configuration
   */
  public getApiKey(): string {
    return this.get<string>('apiKey', '');
  }

  /**
   * Set the API key
   * @param apiKey The API key to set
   */
  public async setApiKey(apiKey: string): Promise<void> {
    await this.update('apiKey', apiKey);
  }

  /**
   * Get the currently selected model
   */
  public getModel(): AIModelType {
    return this.get<AIModelType>('model', AIModelType.STANDARD);
  }

  /**
   * Set the model
   * @param model The model to set
   */
  public async setModel(model: AIModelType): Promise<void> {
    await this.update('model', model);
  }

  /**
   * Check if auto-completion is enabled
   */
  public isAutoCompleteEnabled(): boolean {
    return this.get<boolean>('autoComplete', true);
  }

  /**
   * Enable or disable auto-completion
   * @param enabled Whether auto-completion should be enabled
   */
  public async setAutoComplete(enabled: boolean): Promise<void> {
    await this.update('autoComplete', enabled);
  }

  /**
   * Check if telemetry is enabled
   */
  public isTelemetryEnabled(): boolean {
    return this.get<boolean>('telemetry', true);
  }

  /**
   * Enable or disable telemetry
   * @param enabled Whether telemetry should be enabled
   */
  public async setTelemetry(enabled: boolean): Promise<void> {
    await this.update('telemetry', enabled);
  }

  /**
   * Get all settings
   */
  public getAllSettings(): M31Settings {
    const settings: M31Settings = {
      apiKey: this.getApiKey(),
      model: this.getModel(),
      autoComplete: this.isAutoCompleteEnabled(),
      telemetry: this.isTelemetryEnabled(),
      useChat: this.get<boolean>('useChat', true),
      advanced: this.get<M31Settings['advanced']>('advanced', this.defaultSettings.advanced),
      codeGeneration: this.get<M31Settings['codeGeneration']>('codeGeneration', this.defaultSettings.codeGeneration),
      codeCompletion: this.get<M31Settings['codeCompletion']>('codeCompletion', this.defaultSettings.codeCompletion),
      contextCollection: this.get<M31Settings['contextCollection']>('contextCollection', this.defaultSettings.contextCollection),
      keyBindings: this.get<M31Settings['keyBindings']>('keyBindings', this.defaultSettings.keyBindings),
      formatting: this.get<M31Settings['formatting']>('formatting', this.defaultSettings.formatting),
      customModels: this.get<M31Settings['customModels']>('customModels', this.defaultSettings.customModels),
      customPrompts: this.get<M31Settings['customPrompts']>('customPrompts', this.defaultSettings.customPrompts),
      languages: this.get<M31Settings['languages']>('languages', this.defaultSettings.languages),
      themePalette: this.get<M31Settings['themePalette']>('themePalette', this.defaultSettings.themePalette),
    };

    return settings;
  }

  /**
   * Reset all settings to default values
   */
  public async resetToDefaults(): Promise<void> {
    // Get all settings keys
    const config = this.getConfig();
    const keys = Object.keys(this.defaultSettings);

    // Reset each key to its default value
    for (const key of keys) {
      const defaultValue = (this.defaultSettings as any)[key];
      await config.update(key, defaultValue, vscode.ConfigurationTarget.Global);
    }

    this.logger.info('Reset all settings to defaults');
  }

  /**
   * Get the default settings
   */
  private getDefaultSettings(): M31Settings {
    return {
      apiKey: '',
      model: AIModelType.STANDARD,
      autoComplete: true,
      telemetry: true,
      useChat: true,
      advanced: {
        debug: false,
        logLevel: 'info',
        timeout: 30000,
        retries: 3,
        useCache: true,
        cacheTTL: 86400,
        workspaceTrust: true,
        experimental: false,
      },
      codeGeneration: {
        includeComments: true,
        maxTokens: 2048,
        temperature: 0.7,
        includeTests: false,
        useTypeInference: true,
      },
      codeCompletion: {
        enabled: true,
        triggerCharacters: ['.', '(', '{', '[', ',', ':', ' '],
        minWordLength: 2,
        maxSuggestions: 5,
        debounceTime: 300,
        experimentalMultilineCompletion: false,
        linesToContextBefore: 10,
        linesToContextAfter: 5,
        tabToAccept: true,
        languages: {
          javascript: true,
          typescript: true,
          python: true,
          java: true,
          csharp: true,
          cpp: true,
          go: true,
          ruby: true,
          php: true,
          html: true,
          css: true,
          markdown: true,
        },
      },
      contextCollection: {
        strategy: 'workspace',
        maxFiles: 20,
        maxFileSizeKb: 100,
        excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        includePatterns: [],
        collectDependencies: true,
        preferCurrentFile: true,
        includeSelection: true,
        treatAsContext: {
          imports: true,
          types: true,
          docs: true,
          tests: false,
        },
        languageSpecific: {},
      },
      keyBindings: {
        generateCode: 'ctrl+alt+g',
        explainCode: 'ctrl+alt+e',
        generateCommit: 'ctrl+alt+c',
        addLogs: 'ctrl+alt+l',
        formatCode: 'ctrl+alt+f',
        toggleChat: 'ctrl+alt+space',
        acceptSuggestion: 'tab',
        dismissSuggestion: 'escape',
      },
      formatting: {
        formatter: 'prettier',
        formatOnSave: false,
        formatOnPaste: false,
        formatOnType: false,
        indentSize: 2,
        tabSize: 2,
        insertSpaces: true,
        bracketSpacing: true,
        singleQuote: true,
        trailingComma: 'es5',
        semicolons: true,
        printWidth: 80,
      },
      customModels: [],
      customPrompts: [],
      languages: {
        languages: {
          javascript: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.8,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          typescript: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 1.0,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          python: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.7,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          // Add other language defaults as needed
          java: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.9,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          csharp: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.9,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          cpp: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.9,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          go: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.8,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          rust: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.9,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          ruby: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.7,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          php: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 1.0,
              typeWeight: 0.7,
              functionWeight: 1.0,
              commentWeight: 0.5,
            },
            suggestImports: true,
            suggestTests: false,
            useTypeInference: true,
          },
          html: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 0.7,
              typeWeight: 0.5,
              functionWeight: 0.7,
              commentWeight: 0.5,
            },
            suggestImports: false,
            suggestTests: false,
            useTypeInference: false,
          },
          css: {
            enabled: true,
            autoComplete: true,
            customPrompts: [],
            contextRelevance: {
              importWeight: 0.7,
              typeWeight: 0.5,
              functionWeight: 0.5,
              commentWeight: 0.5,
            },
            suggestImports: false,
            suggestTests: false,
            useTypeInference: false,
          },
        },
      },
      themePalette: {
        suggestionBackground: '#252526',
        suggestionForeground: '#CCCCCC',
        suggestionSelectedBackground: '#04395E',
        suggestionSelectedForeground: '#FFFFFF',
        suggestionBorder: '#454545',
        chatBackground: '#1E1E1E',
        chatForeground: '#CCCCCC',
        chatUserMessageBackground: '#2B2B2B',
        chatUserMessageForeground: '#CCCCCC',
        chatAssistantMessageBackground: '#1E3A5E',
        chatAssistantMessageForeground: '#FFFFFF',
        iconColor: '#3794FF',
      },
    };
  }
} 