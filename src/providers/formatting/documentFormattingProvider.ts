import * as vscode from 'vscode';
import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';

/**
 * Provider for document formatting using configured formatters
 */
export class M31DocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {
  private configManager: ConfigManager;
  private logger: Logger;

  constructor() {
    this.configManager = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
  }

  /**
   * Provide formatting edits for a document
   */
  public async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[] | null> {
    try {
      // Get formatting settings
      const settings = this.configManager.getAllSettings();
      const formatterType = settings.formatting.formatter;
      
      // Check if we should handle formatting
      if (formatterType === 'default') {
        // Let VSCode default formatter handle it
        return null;
      }
      
      if (token.isCancellationRequested) {
        return null;
      }
      
      // Get document text
      const documentText = document.getText();
      
      // In a real implementation, we would use the selected formatter (e.g., prettier)
      // For now, we'll just provide a simple indentation formatter as an example
      const formattedText = this.formatText(
        documentText, 
        document.languageId,
        options.insertSpaces,
        options.tabSize
      );
      
      if (formattedText === documentText) {
        // No changes needed
        return [];
      }
      
      // Create a full document replacement
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(documentText.length)
      );
      
      return [vscode.TextEdit.replace(fullRange, formattedText)];
      
    } catch (error) {
      this.logger.error('Error formatting document', error);
      return null;
    }
  }

  /**
   * Format text (simple implementation)
   */
  private formatText(
    text: string, 
    languageId: string,
    insertSpaces: boolean,
    tabSize: number
  ): string {
    // This is a very simplified formatter example
    // In a real implementation, we would use a proper formatting library
    
    // For demonstration, just adjust indentation based on brackets
    let formatted = '';
    let indentLevel = 0;
    const lines = text.split('\n');
    const indentChar = insertSpaces ? ' '.repeat(tabSize) : '\t';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Adjust indent for closing brackets
      if (trimmedLine.startsWith('}') || trimmedLine.startsWith(')') || trimmedLine.startsWith(']')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add indentation to the line
      if (trimmedLine.length > 0) {
        formatted += indentChar.repeat(indentLevel) + trimmedLine + '\n';
      } else {
        // Keep empty lines
        formatted += '\n';
      }
      
      // Adjust indent for opening brackets
      if (
        trimmedLine.endsWith('{') || 
        trimmedLine.endsWith('(') && !trimmedLine.includes(')') ||
        trimmedLine.endsWith('[') && !trimmedLine.includes(']')
      ) {
        indentLevel++;
      }
    }
    
    return formatted;
  }
} 