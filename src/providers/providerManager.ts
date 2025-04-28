import * as vscode from 'vscode';
import { M31CompletionItemProvider } from './autoComplete/completionItemProvider';
import { M31DocumentFormattingEditProvider } from './formatting/documentFormattingProvider';
import { DiagnosticProvider } from './diagnostics/diagnosticProvider';
import { AgentService } from '../services/ai/agentService';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';

/**
 * Manages the registration of all providers for the extension
 */
export class ProviderManager {
  private context: vscode.ExtensionContext;
  private agentService: AgentService;
  private completionProvider: M31CompletionItemProvider;
  private formattingProvider: M31DocumentFormattingEditProvider;
  private diagnosticProvider: DiagnosticProvider;
  private configManager: ConfigManager;
  private logger: Logger;
  private disposables: vscode.Disposable[] = [];

  constructor(context: vscode.ExtensionContext, agentService: AgentService) {
    this.context = context;
    this.agentService = agentService;
    this.configManager = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
    
    // Initialize providers
    this.completionProvider = new M31CompletionItemProvider();
    this.formattingProvider = new M31DocumentFormattingEditProvider();
    this.diagnosticProvider = new DiagnosticProvider(context, agentService);
    
    // Register providers
    this.registerProviders();
    
    // Listen for configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('m31-agents')) {
          this.updateProviders();
        }
      })
    );
  }

  /**
   * Register all providers
   */
  private registerProviders(): void {
    this.registerCompletionProvider();
    this.registerFormattingProvider();
    // Diagnostic provider is registered in its constructor
    
    this.logger.info('All providers registered');
  }

  /**
   * Register the completion provider
   */
  private registerCompletionProvider(): void {
    const settings = this.configManager.getAllSettings();
    
    if (settings.codeCompletion.enabled) {
      // Get supported languages
      const languages = Object.entries(settings.codeCompletion.languages)
        .filter(([_, enabled]) => enabled)
        .map(([lang]) => lang);
      
      // Register for each supported language
      languages.forEach(language => {
        const triggerCharacters = settings.codeCompletion.triggerCharacters;
        
        const disposable = vscode.languages.registerCompletionItemProvider(
          { language },
          this.completionProvider,
          ...triggerCharacters
        );
        
        this.disposables.push(disposable);
      });
      
      this.logger.info('Completion provider registered', { languages });
    } else {
      this.logger.info('Completion provider not registered (disabled in settings)');
    }
  }

  /**
   * Register the formatting provider
   */
  private registerFormattingProvider(): void {
    const settings = this.configManager.getAllSettings();
    
    if (settings.formatting.formatter === 'custom') {
      // Register for all languages
      const disposable = vscode.languages.registerDocumentFormattingEditProvider(
        '*',
        this.formattingProvider
      );
      
      this.disposables.push(disposable);
      
      this.logger.info('Formatting provider registered');
    } else {
      this.logger.info('Custom formatting provider not registered (disabled in settings)');
    }
  }

  /**
   * Update providers when configuration changes
   */
  private updateProviders(): void {
    // Dispose all current providers
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    
    // Re-register providers with new settings
    this.registerProviders();
  }

  /**
   * Dispose all providers
   */
  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    
    this.diagnosticProvider.dispose();
    this.completionProvider.dispose();
  }
} 