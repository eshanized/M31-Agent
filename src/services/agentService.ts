import * as vscode from 'vscode';
import axios from 'axios';

export class AgentService implements vscode.Disposable {
  private context: vscode.ExtensionContext;
  private disposables: vscode.Disposable[] = [];
  private selectedModel: string = 'standard';

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadConfiguration();

    // Listen for configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('m31-agents')) {
          this.loadConfiguration();
        }
      })
    );
  }

  private loadConfiguration() {
    const config = vscode.workspace.getConfiguration('m31-agents');
    this.selectedModel = config.get('model', 'standard');
  }

  public setModel(model: string) {
    this.selectedModel = model;
    const config = vscode.workspace.getConfiguration('m31-agents');
    config.update('model', model, vscode.ConfigurationTarget.Global);
  }

  public getModel(): string {
    return this.selectedModel;
  }

  public async generateCode(prompt: string): Promise<string> {
    // In a real implementation, this would call an AI service
    try {
      return `// Generated code based on: ${prompt}\nfunction example() {\n  console.log("This is a sample generated code");\n}\n`;
    } catch (error) {
      vscode.window.showErrorMessage('Error generating code: ' + (error as Error).message);
      return '';
    }
  }

  public async explainCode(code: string): Promise<string> {
    // In a real implementation, this would call an AI service
    try {
      return `This code appears to be a JavaScript function that logs a message to the console.`;
    } catch (error) {
      vscode.window.showErrorMessage('Error explaining code: ' + (error as Error).message);
      return '';
    }
  }

  public async generateCommitMessage(diff: string): Promise<string> {
    // In a real implementation, this would analyze the diff and generate a commit message
    try {
      return `feat: implement new functionality`;
    } catch (error) {
      vscode.window.showErrorMessage('Error generating commit message: ' + (error as Error).message);
      return '';
    }
  }

  public async addLogging(code: string): Promise<string> {
    // In a real implementation, this would parse the code and add appropriate logging
    try {
      return code.replace(/function (\w+)/g, 'function $1 {\n  console.log("Function $1 called");');
    } catch (error) {
      vscode.window.showErrorMessage('Error adding logs: ' + (error as Error).message);
      return code;
    }
  }

  public async getCodeCompletion(document: vscode.TextDocument, position: vscode.Position): Promise<string> {
    // In a real implementation, this would provide AI-based code completion
    try {
      const line = document.lineAt(position.line).text;
      const prefix = line.substring(0, position.character);
      
      if (prefix.trim().endsWith('console.')) {
        return 'log("Hello World")';
      }
      
      return '';
    } catch (error) {
      console.error('Error in code completion:', error);
      return '';
    }
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }
} 