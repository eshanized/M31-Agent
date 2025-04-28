import * as vscode from 'vscode';
import { ApiClient } from './api/apiClient';
import { StatusBarManager } from './views/statusBar';
import { AgentService } from './services/ai/agentService';
import { CompletionService } from './services/ai/completionService';
import { TelemetryService } from './services/telemetry/telemetryService';
import { CommandManager } from './commands/commandManager';
import { ProviderManager } from './providers/providerManager';
import { ConfigManager } from './utils/config';
import { Logger } from './utils/logger';
import { WebviewService } from './services/webview/webviewService';
import { TelemetryEventType } from './types/telemetry';

// The extension activation context
let extContext: vscode.ExtensionContext;

/**
 * Activates the extension
 * @param context The extension context
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  extContext = context;
  
  try {
    // Initialize core services
    const logger = Logger.getInstance();
    logger.info('M31-Agents extension is starting...');
    
    const config = ConfigManager.getInstance();
    const telemetry = TelemetryService.getInstance();
    
    // Initialize API client
    const apiClient = ApiClient.getInstance();
    
    // Initialize AI services
    const agentService = AgentService.getInstance(context);
    const completionService = CompletionService.getInstance();
    
    // Initialize UI components
    const statusBar = new StatusBarManager(context);
    const webviewService = WebviewService.getInstance();
    webviewService.initialize(context);
    
    // Initialize providers
    const providerManager = new ProviderManager(context, agentService);
    context.subscriptions.push(providerManager);
    
    // Register commands
    const commandManager = new CommandManager(
      context,
      agentService,
      completionService,
      webviewService,
      statusBar
    );
    
    // Track activation
    telemetry.trackEvent({
      type: TelemetryEventType.EXTENSION_ACTIVATED,
      timestamp: Date.now(),
      sessionId: apiClient.getSessionId()
    });
    
    logger.info('M31-Agents extension successfully activated');
    
    // Display welcome message if this is a new installation
    if (config.get('showWelcomeOnStartup') === true) {
      vscode.commands.executeCommand('m31.showWelcomeView');
      // Set the flag to false after showing the welcome view
      config.update('showWelcomeOnStartup', false);
    }
    
  } catch (error) {
    vscode.window.showErrorMessage('Failed to activate M31-Agents extension');
    console.error('M31-Agents activation failed:', error);
    throw error;
  }
}

/**
 * Deactivates the extension
 */
export function deactivate(): void {
  try {
    const telemetry = TelemetryService.getInstance();
    telemetry.trackEvent({
      type: TelemetryEventType.EXTENSION_DEACTIVATED,
      timestamp: Date.now(),
      sessionId: ApiClient.getInstance().getSessionId()
    });
    telemetry.flush();
    
    const logger = Logger.getInstance();
    logger.info('M31-Agents extension is shutting down...');
    
  } catch (error) {
    console.error('Error during deactivation:', error);
  }
} 