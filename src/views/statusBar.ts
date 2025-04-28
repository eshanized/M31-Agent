import * as vscode from 'vscode';
import { ConfigManager } from '../utils/config';
import { Logger } from '../utils/logger';

/**
 * Manages the status bar item for the M31-Agents extension
 */
export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private configManager: ConfigManager;
  private logger: Logger;

  constructor(context: vscode.ExtensionContext) {
    this.logger = Logger.getInstance();
    this.configManager = ConfigManager.getInstance();
    
    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    
    this.statusBarItem.name = 'M31 Agents';
    this.statusBarItem.command = 'm31.showSettings';
    this.statusBarItem.tooltip = 'M31 AI Agents - Click to open settings';
    
    // Update status bar with current model
    this.updateStatusBar();
    
    // Subscribe to configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('m31-agents.model')) {
          this.updateStatusBar();
        }
      })
    );
    
    // Add to subscriptions
    context.subscriptions.push(this.statusBarItem);
    
    // Show status bar
    this.statusBarItem.show();
  }

  /**
   * Update the status bar with the current model
   */
  public updateStatusBar(): void {
    try {
      const model = this.configManager.getModel();
      this.statusBarItem.text = `$(sparkle) M31: ${model}`;
    } catch (error) {
      this.logger.error('Error updating status bar', error);
      this.statusBarItem.text = '$(sparkle) M31';
    }
  }

  /**
   * Set a temporary message in the status bar
   * @param message The message to display
   * @param timeout The time in milliseconds to display the message
   */
  public setTemporaryMessage(message: string, timeout: number = 3000): void {
    const originalText = this.statusBarItem.text;
    
    this.statusBarItem.text = message;
    
    setTimeout(() => {
      this.statusBarItem.text = originalText;
    }, timeout);
  }

  /**
   * Show the status bar item
   */
  public show(): void {
    this.statusBarItem.show();
  }

  /**
   * Hide the status bar item
   */
  public hide(): void {
    this.statusBarItem.hide();
  }

  /**
   * Dispose the status bar item
   */
  public dispose(): void {
    this.statusBarItem.dispose();
  }
} 