/// <reference types="node" />
import * as vscode from 'vscode';
import { AgentService } from '../../services/ai/agentService';
import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';

// List of supported document languages for diagnostics
const SUPPORTED_LANGUAGES = [
    'typescript',
    'javascript',
    'python',
    'rust',
    'go',
    'java',
    'c',
    'cpp',
    'csharp'
];

/**
 * DiagnosticProvider handles the generation and management of diagnostic information
 * for supported languages using AI-powered analysis.
 */
export class DiagnosticProvider {
    private context: vscode.ExtensionContext;
    private agentService: AgentService;
    private diagnosticCollection: vscode.DiagnosticCollection;
    private pendingDiagnostics: Map<string, NodeJS.Timeout> = new Map();
    private readonly diagnosticSource = 'M31-Agents';
    private documentTimers: Map<string, NodeJS.Timeout>;
    private debounceTime = 1000; // 1 second debounce time
    private configManager: ConfigManager;
    private logger: Logger;

    constructor(context: vscode.ExtensionContext, agentService: AgentService) {
        this.context = context;
        this.agentService = agentService;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection(this.diagnosticSource);
        this.configManager = ConfigManager.getInstance();
        this.logger = Logger.getInstance();
        this.documentTimers = new Map<string, NodeJS.Timeout>();
        
        context.subscriptions.push(this.diagnosticCollection);
        this.registerEventListeners();
    }

    /**
     * Register all event listeners for document changes
     */
    private registerEventListeners(): void {
        // Register document change event
        this.context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(this.onDocumentChange, this)
        );
        
        // Register document open event
        this.context.subscriptions.push(
            vscode.workspace.onDidOpenTextDocument(this.onDocumentOpen, this)
        );
        
        // Register document close event
        this.context.subscriptions.push(
            vscode.workspace.onDidCloseTextDocument(this.onDocumentClose, this)
        );
    }

    /**
     * Handle document change event
     */
    private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        // Skip if diagnostics are disabled
        if (!this.isDiagnosticsEnabled()) {
            return;
        }
        
        const document = event.document;
        
        // Skip non-file documents or unsupported languages
        if (document.uri.scheme !== 'file' || !this.isSupportedLanguage(document.languageId)) {
            return;
        }
        
        // Schedule diagnostic analysis with debounce
        this.scheduleDiagnostics(document);
    }

    /**
     * Handle document open event
     */
    private onDocumentOpen(document: vscode.TextDocument): void {
        // Skip if diagnostics are disabled
        if (!this.isDiagnosticsEnabled()) {
            return;
        }
        
        // Skip non-file documents or unsupported languages
        if (document.uri.scheme !== 'file' || !this.isSupportedLanguage(document.languageId)) {
            return;
        }
        
        // Schedule diagnostic analysis with debounce
        this.scheduleDiagnostics(document);
    }

    /**
     * Handle document close event
     */
    private onDocumentClose(document: vscode.TextDocument): void {
        const uri = document.uri.toString();
        
        // Clear pending diagnostics
        if (this.pendingDiagnostics.has(uri)) {
            clearTimeout(this.pendingDiagnostics.get(uri));
            this.pendingDiagnostics.delete(uri);
        }
        
        // Clear diagnostics for the document
        this.diagnosticCollection.delete(document.uri);
    }

    /**
     * Schedules diagnostics generation with debouncing
     * @param document The document to analyze
     */
    private scheduleDiagnostics(document: vscode.TextDocument): void {
        // Don't schedule if the document shouldn't be analyzed
        if (!this.shouldAnalyzeDocument(document)) {
            return;
        }
        
        const uri = document.uri.toString();
        
        // Clear existing timer if there is one
        if (this.documentTimers.has(uri)) {
            clearTimeout(this.documentTimers.get(uri));
        }
        
        // Set new timer
        const timerId = setTimeout(() => {
            this.analyzeDiagnostics(document).catch(error => {
                this.logger.error('Error analyzing diagnostics', error);
            });
            this.documentTimers.delete(uri);
        }, this.debounceTime);
        
        this.documentTimers.set(uri, timerId);
    }

    /**
     * Analyze document and provide diagnostics
     */
    private async analyzeDiagnostics(document: vscode.TextDocument): Promise<void> {
        try {
            // Skip empty documents
            if (document.getText().trim().length === 0) {
                this.diagnosticCollection.delete(document.uri);
                return;
            }
            
            this.logger.debug('Analyzing diagnostics', {
                document: document.fileName,
                languageId: document.languageId,
                lineCount: document.lineCount
            });
            
            // For now, we'll implement a simple analysis
            // In a real implementation, this would call the AI service for code analysis
            const diagnostics: vscode.Diagnostic[] = [];
            
            // Example: Find potential null reference issues in TypeScript/JavaScript
            if (['typescript', 'javascript', 'typescriptreact', 'javascriptreact'].includes(document.languageId)) {
                const text = document.getText();
                const nullRefRegex = /(\w+)\.([\w.]+)\s*(?:\(|;|\)|\s|$)/g;
                let match;
                
                while ((match = nullRefRegex.exec(text)) !== null) {
                    const varName = match[1];
                    
                    // Find variable declaration with null/undefined check
                    const checkRegex = new RegExp(`if\\s*\\(\\s*(?:!|null|undefined)\\s*===?\\s*${varName}\\s*\\)`, 'g');
                    const hasCheck = checkRegex.test(text);
                    
                    // For demonstration, we'll flag variables with specific patterns
                    if (['data', 'result', 'response', 'user', 'item'].includes(varName) && !hasCheck) {
                        const pos = document.positionAt(match.index);
                        const endPos = document.positionAt(match.index + match[0].length);
                        const range = new vscode.Range(pos, endPos);
                        
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            `Potential null reference: '${varName}' might be null or undefined. Consider adding a null check.`,
                            vscode.DiagnosticSeverity.Warning
                        );
                        
                        diagnostic.source = this.diagnosticSource;
                        diagnostic.code = 'potential-null-ref';
                        diagnostics.push(diagnostic);
                    }
                }
            }
            
            // Update diagnostics for this document
            this.diagnosticCollection.set(document.uri, diagnostics);
            
        } catch (error) {
            this.logger.error('Error in diagnostic analysis', error, {
                document: document.fileName
            });
            
            // Clear diagnostics on error to avoid stale diagnostics
            this.diagnosticCollection.delete(document.uri);
        }
    }

    /**
     * Check if diagnostics are enabled
     */
    private isDiagnosticsEnabled(): boolean {
        const settings = this.configManager.getAllSettings();
        return settings.advanced.debug || settings.advanced.experimental;
    }

    /**
     * Check if the language is supported for diagnostics
     */
    private isSupportedLanguage(languageId: string): boolean {
        return SUPPORTED_LANGUAGES.includes(languageId);
    }

    /**
     * Determines if a document should be analyzed for diagnostics
     * @param document The document to check
     * @returns True if the document should be analyzed
     */
    private shouldAnalyzeDocument(document: vscode.TextDocument): boolean {
        // Check if document language is supported
        if (!this.isSupportedLanguage(document.languageId)) {
            return false;
        }
        
        // Skip very large files
        if (document.getText().length > 100000) {
            return false;
        }
        
        // Skip non-file URIs
        if (document.uri.scheme !== 'file') {
            return false;
        }
        
        return true;
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        // Clear all pending diagnostics
        this.documentTimers.forEach((timerId) => {
            clearTimeout(timerId);
        });
        this.documentTimers.clear();
        
        // Clear all diagnostics
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
    }
} 