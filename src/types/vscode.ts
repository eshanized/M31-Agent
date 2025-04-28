/**
 * Type definitions for VS Code integration
 */

import * as vscode from 'vscode';
import { Disposable } from './common';

export interface ExtensionContext extends vscode.ExtensionContext {}

export interface VSCodeIntegration {
  registerCommand(command: string, callback: (...args: any[]) => any): Disposable;
  registerTextEditorCommand(command: string, callback: (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => void): Disposable;
  registerCompletionProvider(selector: vscode.DocumentSelector, provider: vscode.CompletionItemProvider, ...triggerCharacters: string[]): Disposable;
  registerCodeActionsProvider(selector: vscode.DocumentSelector, provider: vscode.CodeActionProvider): Disposable;
  registerHoverProvider(selector: vscode.DocumentSelector, provider: vscode.HoverProvider): Disposable;
  registerWebviewViewProvider(viewId: string, provider: vscode.WebviewViewProvider): Disposable;
  registerTreeDataProvider<T>(viewId: string, provider: vscode.TreeDataProvider<T>): Disposable;
  registerFileSystemProvider(scheme: string, provider: vscode.FileSystemProvider): Disposable;
  registerDiagnosticCollection(name: string): vscode.DiagnosticCollection;
  registerDocumentFormattingEditProvider(selector: vscode.DocumentSelector, provider: vscode.DocumentFormattingEditProvider): Disposable;
  
  createOutputChannel(name: string): vscode.OutputChannel;
  createWebviewPanel(viewType: string, title: string, showOptions: vscode.ViewColumn, options?: vscode.WebviewPanelOptions & vscode.WebviewOptions): vscode.WebviewPanel;
  createStatusBarItem(alignment?: vscode.StatusBarAlignment, priority?: number): vscode.StatusBarItem;
  createTerminal(options?: vscode.TerminalOptions): vscode.Terminal;
  
  showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined>;
  showWarningMessage(message: string, ...items: string[]): Thenable<string | undefined>;
  showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined>;
  showQuickPick(items: string[] | Thenable<string[]>, options?: vscode.QuickPickOptions): Thenable<string | undefined>;
  showInputBox(options?: vscode.InputBoxOptions): Thenable<string | undefined>;
  
  openTextDocument(uri: vscode.Uri): Thenable<vscode.TextDocument>;
  showTextDocument(document: vscode.TextDocument, column?: vscode.ViewColumn, preserveFocus?: boolean): Thenable<vscode.TextEditor>;
  
  setStatusBarMessage(text: string, hideAfterTimeout?: number): Disposable;
  
  getConfiguration(section?: string, scope?: vscode.ConfigurationScope): vscode.WorkspaceConfiguration;
  onDidChangeConfiguration(listener: (e: vscode.ConfigurationChangeEvent) => any): Disposable;
  
  getWorkspaceFolder(uri: vscode.Uri): vscode.WorkspaceFolder | undefined;
  getWorkspaceFolders(): vscode.WorkspaceFolder[] | undefined;
  
  executeCommand<T>(command: string, ...rest: any[]): Thenable<T | undefined>;
  
  withProgress<R>(options: vscode.ProgressOptions, task: (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => Thenable<R>): Thenable<R>;
}

export interface VSCodeAPIAdapter {
  registerProviders(): void;
  registerCommands(): void;
  registerViews(): void;
  registerEventListeners(): void;
  dispose(): void;
}

export interface EditorPosition {
  line: number;
  character: number;
}

export interface EditorRange {
  start: EditorPosition;
  end: EditorPosition;
}

export interface EditorSelection {
  anchor: EditorPosition;
  active: EditorPosition;
  start: EditorPosition;
  end: EditorPosition;
  isReversed: boolean;
}

export interface EditorEdit {
  replace(range: EditorRange, newText: string): void;
  insert(position: EditorPosition, newText: string): void;
  delete(range: EditorRange): void;
}

export interface DocumentInfo {
  uri: string;
  fileName: string;
  languageId: string;
  version: number;
  lineCount: number;
  text: string;
  isDirty: boolean;
}

export interface EditorInfo {
  selections: EditorSelection[];
  visibleRanges: EditorRange[];
  viewColumn: number;
  document: DocumentInfo;
}

export interface WorkspaceInfo {
  name?: string;
  folders: {
    name: string;
    uri: string;
  }[];
  rootPath?: string;
} 