import * as vscode from 'vscode';

export function registerModelSelectionService(context: vscode.ExtensionContext) {
  // Add a status bar item to show the current model
  const modelStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
  
  // Update model display when config changes
  updateModelDisplay(modelStatusBarItem);
  
  // Register command to change model
  context.subscriptions.push(
    vscode.commands.registerCommand('m31-agents.selectModel', async () => {
      const models = ['standard', 'advanced', 'expert'];
      const currentConfig = vscode.workspace.getConfiguration('m31-agents');
      const currentModel = currentConfig.get('model', 'standard');
      
      const selectedModel = await vscode.window.showQuickPick(models, {
        placeHolder: 'Select AI Model',
        title: 'M31-Agents Model Selection'
      });
      
      if (selectedModel && selectedModel !== currentModel) {
        await currentConfig.update('model', selectedModel, vscode.ConfigurationTarget.Global);
        updateModelDisplay(modelStatusBarItem);
        vscode.window.showInformationMessage(`M31-Agents model changed to: ${selectedModel}`);
      }
    })
  );
  
  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('m31-agents.model')) {
        updateModelDisplay(modelStatusBarItem);
      }
    })
  );
  
  // Add statusBarItem to disposables
  context.subscriptions.push(modelStatusBarItem);
}

function updateModelDisplay(statusBarItem: vscode.StatusBarItem) {
  const config = vscode.workspace.getConfiguration('m31-agents');
  const model = config.get('model', 'standard');
  
  statusBarItem.text = `$(settings-gear) M31: ${capitalizeFirstLetter(model)}`;
  statusBarItem.tooltip = `M31-Agents is using the ${model} model. Click to change.`;
  statusBarItem.command = 'm31-agents.selectModel';
  statusBarItem.show();
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
} 