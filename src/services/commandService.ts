import * as vscode from 'vscode';
import { AgentService } from './agentService';

export function registerCommands(context: vscode.ExtensionContext, agentService: AgentService) {
  
  // Start AI Assistant
  context.subscriptions.push(
    vscode.commands.registerCommand('m31-agents.start', async () => {
      vscode.commands.executeCommand('workbench.view.extension.m31-agents-sidebar');
    })
  );

  // Generate Code
  context.subscriptions.push(
    vscode.commands.registerCommand('m31-agents.generateCode', async () => {
      const prompt = await vscode.window.showInputBox({
        prompt: 'What code would you like to generate?',
        placeHolder: 'E.g., A function to sort an array of numbers'
      });

      if (!prompt) {
        return;
      }

      // Show progress
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating code...',
          cancellable: false
        },
        async (progress) => {
          progress.report({ increment: 50 });
          
          const generatedCode = await agentService.generateCode(prompt);
          
          if (generatedCode) {
            const document = await vscode.workspace.openTextDocument({
              content: generatedCode,
              language: 'javascript'
            });
            
            await vscode.window.showTextDocument(document);
          }
          
          progress.report({ increment: 50 });
        }
      );
    })
  );

  // Explain Code
  context.subscriptions.push(
    vscode.commands.registerCommand('m31-agents.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText) {
        vscode.window.showErrorMessage('No code selected');
        return;
      }

      // Show progress
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Analyzing code...',
          cancellable: false
        },
        async (progress) => {
          progress.report({ increment: 50 });
          
          const explanation = await agentService.explainCode(selectedText);
          
          if (explanation) {
            vscode.window.showInformationMessage(explanation);
          }
          
          progress.report({ increment: 50 });
        }
      );
    })
  );

  // Generate Commit Message
  context.subscriptions.push(
    vscode.commands.registerCommand('m31-agents.generateCommit', async () => {
      // In a real implementation, this would get the git diff
      const diff = "Sample diff content";
      
      // Show progress
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating commit message...',
          cancellable: false
        },
        async (progress) => {
          progress.report({ increment: 50 });
          
          const commitMessage = await agentService.generateCommitMessage(diff);
          
          if (commitMessage) {
            await vscode.env.clipboard.writeText(commitMessage);
            vscode.window.showInformationMessage('Commit message copied to clipboard: ' + commitMessage);
          }
          
          progress.report({ increment: 50 });
        }
      );
    })
  );

  // Add Logging
  context.subscriptions.push(
    vscode.commands.registerCommand('m31-agents.addLogs', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText) {
        vscode.window.showErrorMessage('No code selected');
        return;
      }

      // Show progress
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Adding logs...',
          cancellable: false
        },
        async (progress) => {
          progress.report({ increment: 50 });
          
          const codeWithLogs = await agentService.addLogging(selectedText);
          
          if (codeWithLogs) {
            editor.edit(editBuilder => {
              editBuilder.replace(editor.selection, codeWithLogs);
            });
          }
          
          progress.report({ increment: 50 });
        }
      );
    })
  );
} 