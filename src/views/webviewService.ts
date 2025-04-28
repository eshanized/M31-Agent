import * as vscode from 'vscode';
import { AgentService } from '../services/agentService';

export function registerWebviews(context: vscode.ExtensionContext, agentService: AgentService) {
  // Register tree view providers
  const chatViewProvider = new ChatViewProvider(context.extensionUri, agentService);
  const filesViewProvider = new FilesViewProvider(context.extensionUri);
  
  // Register the providers
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('m31AgentsChatView', chatViewProvider),
    vscode.window.registerWebviewViewProvider('m31AgentsFilesView', filesViewProvider)
  );
}

class ChatViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _agentService: AgentService;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    agentService: AgentService
  ) {
    this._agentService = agentService;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'chatQuery':
            try {
              const response = await this._agentService.generateCode(message.text);
              // Send response back to webview
              webviewView.webview.postMessage({ command: 'response', text: response });
            } catch (err) {
              webviewView.webview.postMessage({ 
                command: 'error', 
                text: 'Error processing request: ' + (err as Error).message 
              });
            }
            break;
        }
      },
      undefined,
      context.subscriptions
    );
  }

  private _getHtmlForWebview() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>M31 Agent Chat</title>
      <style>
        body {
          font-family: var(--vscode-font-family);
          padding: 10px;
          color: var(--vscode-foreground);
        }
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 10px;
          border: 1px solid var(--vscode-input-border);
          border-radius: 4px;
          padding: 10px;
          min-height: 200px;
        }
        .input-area {
          display: flex;
        }
        #chat-input {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--vscode-input-border);
          background: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border-radius: 4px;
        }
        button {
          margin-left: 5px;
          border: none;
          padding: 8px 12px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: var(--vscode-button-hoverBackground);
        }
        .message {
          margin: 5px 0;
          padding: 8px 12px;
          border-radius: 4px;
        }
        .user-message {
          background: var(--vscode-editor-inactiveSelectionBackground);
          align-self: flex-end;
        }
        .agent-message {
          background: var(--vscode-editor-selectionBackground);
        }
      </style>
    </head>
    <body>
      <div class="chat-container">
        <div class="messages" id="messages"></div>
        <div class="input-area">
          <input type="text" id="chat-input" placeholder="Ask me anything about your code...">
          <button id="send-button">Send</button>
        </div>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const messagesContainer = document.getElementById('messages');
        
        // Handle sending messages
        function sendMessage() {
          const text = chatInput.value.trim();
          if (text) {
            // Add user message to UI
            addMessage(text, 'user');
            // Send to extension
            vscode.postMessage({
              command: 'chatQuery',
              text: text
            });
            // Clear input
            chatInput.value = '';
          }
        }
        
        // Add message to UI
        function addMessage(text, sender) {
          const messageElement = document.createElement('div');
          messageElement.classList.add('message');
          messageElement.classList.add(sender === 'user' ? 'user-message' : 'agent-message');
          messageElement.textContent = text;
          messagesContainer.appendChild(messageElement);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Handle button click
        sendButton.addEventListener('click', sendMessage);
        
        // Handle Enter key
        chatInput.addEventListener('keyup', (e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });
        
        // Handle messages from extension
        window.addEventListener('message', (event) => {
          const message = event.data;
          switch (message.command) {
            case 'response':
              addMessage(message.text, 'agent');
              break;
            case 'error':
              addMessage('Error: ' + message.text, 'agent');
              break;
          }
        });
      </script>
    </body>
    </html>`;
  }
}

class FilesViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();
  }

  private _getHtmlForWebview() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Files</title>
      <style>
        body {
          font-family: var(--vscode-font-family);
          padding: 10px;
          color: var(--vscode-foreground);
        }
        .files-container {
          height: 100%;
        }
        .actions {
          margin-bottom: 10px;
        }
        button {
          border: none;
          padding: 6px 10px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border-radius: 4px;
          cursor: pointer;
          margin-right: 5px;
        }
        button:hover {
          background: var(--vscode-button-hoverBackground);
        }
        .file-list {
          border: 1px solid var(--vscode-input-border);
          border-radius: 4px;
          padding: 10px;
          min-height: 200px;
          overflow-y: auto;
        }
        .info-text {
          color: var(--vscode-descriptionForeground);
          font-style: italic;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="files-container">
        <div class="actions">
          <button id="select-files-btn">Select Files</button>
          <button id="refresh-btn">Refresh</button>
        </div>
        <div class="file-list" id="file-list">
          <p class="info-text">Selected files for context will appear here.</p>
        </div>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        const selectFilesBtn = document.getElementById('select-files-btn');
        const refreshBtn = document.getElementById('refresh-btn');
        
        selectFilesBtn.addEventListener('click', () => {
          vscode.postMessage({ command: 'selectFiles' });
        });
        
        refreshBtn.addEventListener('click', () => {
          vscode.postMessage({ command: 'refreshFileList' });
        });
        
        // In a real implementation, we would handle file selection and display them here
      </script>
    </body>
    </html>`;
  }
} 