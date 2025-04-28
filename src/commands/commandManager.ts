import * as vscode from 'vscode';
import { AgentService } from '../services/ai/agentService';
import { CompletionService } from '../services/ai/completionService';
import { WebviewService } from '../services/webview/webviewService';
import { StatusBarManager } from '../views/statusBar';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../utils/config';

/**
 * Manages all commands registered by the M31-Agents extension
 */
export class CommandManager {
  private context: vscode.ExtensionContext;
  private agentService: AgentService;
  private completionService: CompletionService;
  private webviewService: WebviewService;
  private statusBar: StatusBarManager;
  private logger: Logger;
  private configManager: ConfigManager;

  constructor(
    context: vscode.ExtensionContext,
    agentService: AgentService, 
    completionService: CompletionService,
    webviewService: WebviewService,
    statusBar: StatusBarManager
  ) {
    this.context = context;
    this.agentService = agentService;
    this.completionService = completionService;
    this.webviewService = webviewService;
    this.statusBar = statusBar;
    this.logger = Logger.getInstance();
    this.configManager = ConfigManager.getInstance();
    
    this.registerCommands();
  }

  /**
   * Register all commands for the extension
   */
  private registerCommands(): void {
    this.registerGenerateCodeCommand();
    this.registerExplainCodeCommand();
    this.registerGenerateCommitCommand();
    this.registerAddLogsCommand();
    this.registerToggleChatCommand();
    this.registerShowSettingsCommand();
    this.registerChangeModelCommand();
    this.registerShowWelcomeCommand();
    this.registerFeedbackCommand();
  }

  /**
   * Register the generate code command
   */
  private registerGenerateCodeCommand(): void {
    const disposable = vscode.commands.registerCommand('m31.generateCode', async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('Open a file to generate code');
          return;
        }

        // Get user input for the code generation prompt
        const prompt = await vscode.window.showInputBox({
          prompt: 'Describe the code you want to generate',
          placeHolder: 'Generate a function that...'
        });

        if (!prompt) {
          return;
        }

        // Show progress indicator
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Generating code...',
            cancellable: false
          },
          async () => {
            const language = editor.document.languageId;
            const result = await this.agentService.generateCode({
              prompt,
              language
            });

            if (result.success) {
              // Insert the generated code at the cursor position
              editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, result.value);
              });
            } else {
              vscode.window.showErrorMessage(`Code generation failed: ${result.error.message}`);
            }
          }
        );
      } catch (error) {
        this.logger.error('Error in generate code command', error);
        vscode.window.showErrorMessage('Failed to generate code. See logs for details.');
      }
    });

    this.context.subscriptions.push(disposable);
  }

  /**
   * Register the explain code command
   */
  private registerExplainCodeCommand(): void {
    const disposable = vscode.commands.registerCommand('m31.explainCode', async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage('Open a file to explain code');
          return;
        }

        // Get the selected code or current function
        const selection = editor.selection;
        const code = selection.isEmpty 
          ? editor.document.getText() 
          : editor.document.getText(selection);

        if (!code.trim()) {
          vscode.window.showInformationMessage('No code selected to explain');
          return;
        }

        // Show progress indicator
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing code...',
            cancellable: false
          },
          async () => {
            const language = editor.document.languageId;
            const result = await this.agentService.explainCode({
              code,
              language
            });

            if (result.success) {
              // Show the explanation in a webview
              this.webviewService.showExplanationView(code, result.value, language);
            } else {
              vscode.window.showErrorMessage(`Code explanation failed: ${result.error.message}`);
            }
          }
        );
      } catch (error) {
        this.logger.error('Error in explain code command', error);
        vscode.window.showErrorMessage('Failed to explain code. See logs for details.');
      }
    });

    this.context.subscriptions.push(disposable);
  }

  /**
   * Register the generate commit message command
   */
  private registerGenerateCommitCommand(): void {
    // Implementation will be added when git service is available
    const disposable = vscode.commands.registerCommand('m31.generateCommit', async () => {
      vscode.window.showInformationMessage('Generate commit message feature coming soon!');
    });
    this.context.subscriptions.push(disposable);
  }

  /**
   * Register the add logs command
   */
  private registerAddLogsCommand(): void {
    // Implementation will be added in future
    const disposable = vscode.commands.registerCommand('m31.addLogs', async () => {
      vscode.window.showInformationMessage('Add logs feature coming soon!');
    });
    this.context.subscriptions.push(disposable);
  }

  /**
   * Register the toggle chat command
   */
  private registerToggleChatCommand(): void {
    const disposable = vscode.commands.registerCommand('m31.toggleChat', async () => {
      this.webviewService.toggleChatView();
    });
    this.context.subscriptions.push(disposable);
  }

  /**
   * Register the show settings command
   */
  private registerShowSettingsCommand(): void {
    const disposable = vscode.commands.registerCommand('m31.showSettings', async () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'm31-agents');
    });
    this.context.subscriptions.push(disposable);
  }

  /**
   * Register the change model command
   */
  private registerChangeModelCommand(): void {
    const disposable = vscode.commands.registerCommand('m31.changeModel', async () => {
      // Implementation to show model selection dropdown
      vscode.window.showInformationMessage('Model selection feature coming soon!');
    });
    this.context.subscriptions.push(disposable);
  }

  /**
   * Register the show welcome command
   */
  private registerShowWelcomeCommand(): void {
    const disposable = vscode.commands.registerCommand('m31.showWelcomeView', async () => {
      this.webviewService.showWelcomeView();
    });
    this.context.subscriptions.push(disposable);
  }

  /**
   * Register the feedback command
   */
  private registerFeedbackCommand(): void {
    const disposable = vscode.commands.registerCommand('m31.sendFeedback', async () => {
      // Implementation for feedback form
      vscode.window.showInformationMessage('Feedback feature coming soon!');
    });
    this.context.subscriptions.push(disposable);
  }
} 