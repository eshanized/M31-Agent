import * as vscode from 'vscode';
import { CompletionService } from '../../services/ai/completionService';
import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';

/**
 * CompletionItemProvider for AI-powered code completions
 */
export class M31CompletionItemProvider implements vscode.CompletionItemProvider {
  private completionService: CompletionService;
  private configManager: ConfigManager;
  private logger: Logger;
  private disposables: vscode.Disposable[] = [];
  private triggerCharacters: string[];

  constructor() {
    this.completionService = CompletionService.getInstance();
    this.configManager = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
    
    // Get trigger characters from configuration
    const settings = this.configManager.getAllSettings();
    this.triggerCharacters = settings.codeCompletion.triggerCharacters;
    
    // Listen for configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('m31-agents.codeCompletion.triggerCharacters')) {
          const settings = this.configManager.getAllSettings();
          this.triggerCharacters = settings.codeCompletion.triggerCharacters;
        }
      })
    );
  }

  /**
   * Provide completion items for the given position in a document
   */
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[] | vscode.CompletionList | null> {
    try {
      // Check if auto-complete is enabled
      if (!this.configManager.isAutoCompleteEnabled()) {
        return null;
      }
      
      // Check if the trigger character is valid
      if (context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter) {
        if (!this.triggerCharacters.includes(context.triggerCharacter || '')) {
          return null;
        }
      }
      
      // Check if language is supported
      const settings = this.configManager.getAllSettings();
      if (!settings.codeCompletion.languages[document.languageId]) {
        return null;
      }
      
      // Get the current line up to the cursor position
      const lineText = document.lineAt(position.line).text;
      const linePrefix = lineText.substring(0, position.character);
      
      // Skip if the line is too short
      if (linePrefix.trim().length < settings.codeCompletion.minWordLength) {
        return null;
      }
      
      // Get file context for better completions
      const fileContext = this.getFileContext(document);
      
      // Get the completion from the completion service
      const completionText = await this.completionService.getCompletion(
        document,
        position,
        fileContext
      );
      
      if (!completionText) {
        return null;
      }
      
      // Create a completion item with the suggestion
      const item = new vscode.CompletionItem(
        completionText,
        vscode.CompletionItemKind.Snippet
      );
      
      item.insertText = completionText;
      item.detail = 'M31 AI Suggestion';
      item.sortText = '0';  // To ensure it appears at the top
      item.preselect = true;
      
      return [item];
      
    } catch (error) {
      this.logger.error('Error providing completion items', error);
      return null;
    }
  }

  /**
   * Get relevant context from the file for better completions
   */
  private getFileContext(document: vscode.TextDocument): string {
    try {
      // Extract imports and type definitions
      const text = document.getText();
      let context = '';
      
      // Extracting imports
      const importRegex = /import\s+.*?;/g;
      const imports = text.match(importRegex);
      
      if (imports) {
        context += imports.join('\n') + '\n\n';
      }
      
      // Extract type/interface definitions for TypeScript
      if (document.languageId === 'typescript' || document.languageId === 'typescriptreact') {
        const typeRegex = /(interface|type|class|enum)\s+\w+[\s\S]*?{[\s\S]*?}/g;
        const types = text.match(typeRegex);
        
        if (types) {
          context += types.join('\n\n') + '\n\n';
        }
      }
      
      return context;
      
    } catch (error) {
      this.logger.error('Error getting file context', error);
      return '';
    }
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
} 