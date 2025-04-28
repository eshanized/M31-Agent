import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { ConfigManager } from '../../utils/config';

/**
 * Service for managing webview panels
 */
export class WebviewService {
  private static instance: WebviewService;
  private context: vscode.ExtensionContext | undefined;
  private logger: Logger;
  private configManager: ConfigManager;
  private chatPanel: vscode.WebviewPanel | undefined;
  private explanationPanels: Map<string, vscode.WebviewPanel> = new Map();

  private constructor() {
    this.logger = Logger.getInstance();
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * Get the singleton instance of the WebviewService
   */
  public static getInstance(): WebviewService {
    if (!WebviewService.instance) {
      WebviewService.instance = new WebviewService();
    }
    return WebviewService.instance;
  }

  /**
   * Initialize the webview service
   * @param context The extension context
   */
  public initialize(context: vscode.ExtensionContext): void {
    this.context = context;
  }

  /**
   * Show the welcome view
   */
  public showWelcomeView(): void {
    const panel = vscode.window.createWebviewPanel(
      'm31-welcome',
      'Welcome to M31 Agents',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    panel.webview.html = this.getWelcomeViewHtml();
    panel.iconPath = vscode.Uri.joinPath(this.getContext().extensionUri, 'media', 'icon.png');

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'openSettings':
            vscode.commands.executeCommand('m31.showSettings');
            return;
          case 'openDocumentation':
            vscode.env.openExternal(vscode.Uri.parse('https://m31-agents.io/docs'));
            return;
        }
      },
      undefined,
      this.getContext().subscriptions
    );
  }

  /**
   * Toggle the chat view
   */
  public toggleChatView(): void {
    if (this.chatPanel) {
      this.chatPanel.reveal();
    } else {
      this.createChatPanel();
    }
  }

  /**
   * Show explanation view
   * @param code The code to explain
   * @param explanation The explanation
   * @param language The language of the code
   */
  public showExplanationView(code: string, explanation: string, language: string): void {
    const panelId = `explanation-${Date.now()}`;
    
    const panel = vscode.window.createWebviewPanel(
      'm31-explanation',
      'Code Explanation',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.getContext().extensionUri, 'media')
        ]
      }
    );

    panel.webview.html = this.getExplanationViewHtml(code, explanation, language);
    panel.iconPath = vscode.Uri.joinPath(this.getContext().extensionUri, 'media', 'icon.png');
    
    this.explanationPanels.set(panelId, panel);
    
    panel.onDidDispose(() => {
      this.explanationPanels.delete(panelId);
    });
  }

  /**
   * Create the chat panel
   */
  private createChatPanel(): void {
    this.chatPanel = vscode.window.createWebviewPanel(
      'm31-chat',
      'M31 AI Chat',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.getContext().extensionUri, 'media')
        ]
      }
    );

    this.chatPanel.webview.html = this.getChatViewHtml();
    this.chatPanel.iconPath = vscode.Uri.joinPath(this.getContext().extensionUri, 'media', 'icon.png');
    
    this.chatPanel.onDidDispose(() => {
      this.chatPanel = undefined;
    });

    // Handle messages from the webview
    this.chatPanel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'sendMessage':
            this.handleChatMessage(message.text);
            return;
        }
      },
      undefined,
      this.getContext().subscriptions
    );
  }

  /**
   * Handle a chat message
   * @param message The message to handle
   */
  private handleChatMessage(message: string): void {
    // This method will be implemented when the chat backend is available
    this.logger.info('Chat message received', { message });

    if (this.chatPanel) {
      // Mock response for now
      this.chatPanel.webview.postMessage({
        command: 'receiveMessage',
        text: 'Thanks for your message! The chat feature is coming soon.',
        isUser: false
      });
    }
  }

  /**
   * Get the welcome view HTML
   */
  private getWelcomeViewHtml(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to M31 Agents</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            color: var(--vscode-textLink-foreground);
            font-size: 1.8em;
            margin-bottom: 0.5em;
          }
          h2 {
            font-size: 1.4em;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .welcome-card {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 12px;
            border-radius: 2px;
            cursor: pointer;
            margin-right: 10px;
            margin-top: 10px;
          }
          .button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
          }
          .feature-item {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 5px;
            padding: 15px;
          }
          .feature-item h3 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
          }
        </style>
      </head>
      <body>
        <h1>🚀 Welcome to M31 AI Agents</h1>
        
        <div class="welcome-card">
          <h2>Getting Started</h2>
          <p>M31 Agents brings the power of AI to your development workflow. Here are a few ways to get started:</p>
          <button class="button" id="openSettings">Configure Settings</button>
          <button class="button" id="openDocs">View Documentation</button>
        </div>
        
        <h2>Key Features</h2>
        <div class="feature-grid">
          <div class="feature-item">
            <h3>Code Generation</h3>
            <p>Generate code snippets and functions with AI. Use the command <code>M31: Generate Code</code>.</p>
          </div>
          <div class="feature-item">
            <h3>Code Explanation</h3>
            <p>Get AI-powered explanations for code. Select code and use <code>M31: Explain Code</code>.</p>
          </div>
          <div class="feature-item">
            <h3>Commit Messages</h3>
            <p>Generate commit messages based on your changes with <code>M31: Generate Commit Message</code>.</p>
          </div>
          <div class="feature-item">
            <h3>AI Chat</h3>
            <p>Chat with the AI assistant about coding problems with <code>M31: Toggle Chat</code>.</p>
          </div>
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          document.getElementById('openSettings').addEventListener('click', () => {
            vscode.postMessage({
              command: 'openSettings'
            });
          });
          
          document.getElementById('openDocs').addEventListener('click', () => {
            vscode.postMessage({
              command: 'openDocumentation'
            });
          });
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Get the chat view HTML
   */
  private getChatViewHtml(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>M31 AI Chat</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
          }
          #chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
          }
          .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 5px;
            max-width: 80%;
          }
          .user-message {
            background-color: var(--vscode-input-background);
            align-self: flex-end;
            margin-left: auto;
          }
          .ai-message {
            background-color: var(--vscode-textCodeBlock-background);
            align-self: flex-start;
          }
          #input-container {
            padding: 10px;
            display: flex;
            border-top: 1px solid var(--vscode-widget-border);
          }
          #message-input {
            flex: 1;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
          }
          #send-button {
            margin-left: 10px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div id="chat-container">
          <div class="message ai-message">
            <p>👋 Hello! I'm your M31 AI assistant. How can I help you with your code today?</p>
          </div>
        </div>
        
        <div id="input-container">
          <input type="text" id="message-input" placeholder="Type your message..." />
          <button id="send-button">Send</button>
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          const chatContainer = document.getElementById('chat-container');
          const messageInput = document.getElementById('message-input');
          const sendButton = document.getElementById('send-button');
          
          // Send message on button click
          sendButton.addEventListener('click', sendMessage);
          
          // Send message on Enter key
          messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              sendMessage();
            }
          });
          
          // Handle message from extension
          window.addEventListener('message', (event) => {
            const message = event.data;
            
            if (message.command === 'receiveMessage') {
              addMessage(message.text, message.isUser);
            }
          });
          
          function sendMessage() {
            const text = messageInput.value.trim();
            if (text) {
              addMessage(text, true);
              
              vscode.postMessage({
                command: 'sendMessage',
                text: text
              });
              
              messageInput.value = '';
            }
          }
          
          function addMessage(text, isUser) {
            const messageElement = document.createElement('div');
            messageElement.className = isUser ? 'message user-message' : 'message ai-message';
            
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            messageElement.appendChild(paragraph);
            
            chatContainer.appendChild(messageElement);
            
            // Scroll to bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Get the explanation view HTML
   */
  private getExplanationViewHtml(code: string, explanation: string, language: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Explanation</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            color: var(--vscode-textLink-foreground);
            font-size: 1.8em;
            margin-bottom: 0.5em;
          }
          h2 {
            font-size: 1.4em;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .code-section, .explanation-section {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 5px;
            padding: 15px;
          }
          pre {
            margin: 0;
            overflow-x: auto;
            white-space: pre-wrap;
          }
          code {
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
          }
          .explanation-section p {
            margin-top: 0;
          }
        </style>
      </head>
      <body>
        <h1>Code Explanation</h1>
        
        <div class="container">
          <div class="code-section">
            <h2>Code</h2>
            <pre><code>${this.escapeHtml(code)}</code></pre>
          </div>
          
          <div class="explanation-section">
            <h2>Explanation</h2>
            <div>${this.formatExplanation(explanation)}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format the explanation text into paragraphs
   */
  private formatExplanation(text: string): string {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Get the extension context
   */
  private getContext(): vscode.ExtensionContext {
    if (!this.context) {
      throw new Error('WebviewService has not been initialized with a context');
    }
    return this.context;
  }

  /**
   * Dispose all webviews
   */
  public dispose(): void {
    if (this.chatPanel) {
      this.chatPanel.dispose();
      this.chatPanel = undefined;
    }
    
    this.explanationPanels.forEach(panel => {
      panel.dispose();
    });
    
    this.explanationPanels.clear();
  }
} 