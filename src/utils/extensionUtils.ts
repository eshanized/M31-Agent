import * as vscode from 'vscode';

/**
 * Helper functions for the M31-Agents extension
 */
export class ExtensionUtils {
  /**
   * Gets the currently selected text in the active editor
   */
  public static getSelectedText(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return undefined;
    }
    
    return editor.document.getText(editor.selection);
  }
  
  /**
   * Gets the file extension of the current document
   */
  public static getCurrentLanguage(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return undefined;
    }
    
    return editor.document.languageId;
  }
  
  /**
   * Gets the content of the current file
   */
  public static getCurrentFileContent(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return undefined;
    }
    
    return editor.document.getText();
  }
  
  /**
   * Inserts text at the current cursor position
   */
  public static insertText(text: string): Thenable<boolean> | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return undefined;
    }
    
    return editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, text);
    });
  }
  
  /**
   * Replaces the selected text with the provided text
   */
  public static replaceSelectedText(text: string): Thenable<boolean> | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return undefined;
    }
    
    return editor.edit(editBuilder => {
      editBuilder.replace(editor.selection, text);
    });
  }
  
  /**
   * Get the workspace folder paths
   */
  public static getWorkspaceFolders(): string[] {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
      return [];
    }
    
    return folders.map(folder => folder.uri.fsPath);
  }
  
  /**
   * Format provided document (or the current document if none provided)
   */
  public static async formatDocument(document?: vscode.TextDocument): Promise<void> {
    if (!document) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      document = editor.document;
    }
    
    try {
      await vscode.commands.executeCommand('editor.action.formatDocument');
    } catch (error) {
      console.error('Error formatting document:', error);
    }
  }
} 