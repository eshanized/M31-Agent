import * as vscode from 'vscode';
import { AgentService } from '../services/agentService';

class M31CompletionProvider implements vscode.CompletionItemProvider {
  private agentService: AgentService;

  constructor(agentService: AgentService) {
    this.agentService = agentService;
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[] | undefined> {
    // Check if autocompletion is enabled in settings
    const config = vscode.workspace.getConfiguration('m31-agents');
    if (!config.get('autoComplete', true)) {
      return undefined;
    }

    try {
      const suggestion = await this.agentService.getCodeCompletion(document, position);
      
      if (!suggestion) {
        return undefined;
      }

      const completionItem = new vscode.CompletionItem(suggestion);
      completionItem.insertText = suggestion;
      completionItem.detail = 'M31-Agents AI suggestion';
      completionItem.kind = vscode.CompletionItemKind.Snippet;
      
      return [completionItem];
    } catch (error) {
      console.error('Error providing completion:', error);
      return undefined;
    }
  }
}

export function activateCodeCompletion(context: vscode.ExtensionContext, agentService: AgentService) {
  const provider = new M31CompletionProvider(agentService);
  
  // Register completion provider for all languages
  const selector: vscode.DocumentSelector = { scheme: 'file' };
  
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      provider,
      '.',
      '(',
      '{',
      '[',
      ':'
    )
  );
} 