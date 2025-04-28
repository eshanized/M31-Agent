import * as vscode from 'vscode';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';
import { ApiClient } from '../../api/apiClient';
import {
  TelemetryEvent,
  TelemetryEventType,
  ActivationEvent,
  CommandEvent,
  FeatureUsageEvent,
  CodeGenerationEvent,
  CodeExplanationEvent,
  CommitMessageGenerationEvent,
  LogGenerationEvent,
  CodeCompletionEvent,
  ChatEvent,
  ErrorEvent,
  ModelChangedEvent,
  SettingsChangedEvent,
  ApiEvent,
  SuggestionEvent,
  FeedbackEvent,
  PerformanceMetric,
  TelemetryService as ITelemetryService
} from '../../types/telemetry';

/**
 * Service for collecting telemetry data
 */
export class TelemetryService implements ITelemetryService {
  private static instance: TelemetryService;
  private logger: Logger;
  private configManager: ConfigManager;
  private apiClient: ApiClient;
  private sessionId: string;
  private machineId: string;
  private isEnabled: boolean;
  private extensionVersion: string;
  private pendingEvents: TelemetryEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL_MS = 60000; // 1 minute
  private readonly EVENTS_BATCH_SIZE = 20;

  private constructor() {
    this.logger = Logger.getInstance();
    this.configManager = ConfigManager.getInstance();
    this.apiClient = ApiClient.getInstance();
    this.sessionId = uuidv4();
    this.machineId = this.getMachineId();
    this.isEnabled = this.configManager.isTelemetryEnabled();
    this.extensionVersion = this.getExtensionVersion();

    // Start the flush interval
    this.setupFlushInterval();

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('m31-agents.telemetry')) {
        this.isEnabled = this.configManager.isTelemetryEnabled();
        this.logger.info(`Telemetry is now ${this.isEnabled ? 'enabled' : 'disabled'}`);
      }
    });
  }

  /**
   * Get the singleton instance of the TelemetryService
   */
  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Track an event
   */
  public trackEvent(event: TelemetryEvent): void {
    if (!this.isEnabled) {
      return;
    }

    // Enrich the event with session data
    const enrichedEvent: TelemetryEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: this.sessionId,
      properties: {
        ...event.properties,
        extensionVersion: this.extensionVersion,
        vscodeVersion: vscode.version,
        os: `${os.platform()}-${os.release()}`
      }
    };

    this.logger.debug('Tracking telemetry event', enrichedEvent);
    this.pendingEvents.push(enrichedEvent);

    // If we've reached the batch size, flush immediately
    if (this.pendingEvents.length >= this.EVENTS_BATCH_SIZE) {
      this.flush().catch(error => {
        this.logger.error('Error flushing telemetry events', error);
      });
    }
  }

  /**
   * Track an exception
   */
  public trackException(error: Error, componentName: string, severity: string): void {
    if (!this.isEnabled) {
      return;
    }

    const errorEvent: TelemetryEvent = {
      type: TelemetryEventType.ERROR_OCCURRED,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      properties: {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        componentName,
        severity
      }
    };

    this.trackEvent(errorEvent);
  }

  /**
   * Track a metric
   */
  public trackMetric(name: string, value: number): void {
    if (!this.isEnabled) {
      return;
    }

    const metricEvent: TelemetryEvent = {
      type: TelemetryEventType.PERFORMANCE_METRIC,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      measurements: {
        [name]: value
      }
    };

    this.trackEvent(metricEvent);
  }

  /**
   * Flush pending events to the telemetry service
   */
  public async flush(): Promise<void> {
    if (!this.isEnabled || this.pendingEvents.length === 0) {
      return;
    }

    try {
      const eventsToSend = [...this.pendingEvents];
      this.pendingEvents = [];

      // In a real implementation, we would send the events to the backend service
      // For now, we'll just log them
      this.logger.debug(`Flushing ${eventsToSend.length} telemetry events`);

      // Example implementation using the API client
      // const result = await this.apiClient.post('/telemetry/events', { events: eventsToSend });
      // if (!result.success) {
      //   this.logger.error('Failed to send telemetry events', result.error);
      //   // Add the events back to the queue
      //   this.pendingEvents = [...eventsToSend, ...this.pendingEvents];
      // }
    } catch (error) {
      this.logger.error('Error flushing telemetry events', error);
      // Add the events back to the queue
      this.pendingEvents = [...this.pendingEvents];
    }
  }

  /**
   * Enable telemetry collection
   */
  public enable(): void {
    this.isEnabled = true;
    this.configManager.setTelemetry(true).catch(error => {
      this.logger.error('Error enabling telemetry', error);
    });
  }

  /**
   * Disable telemetry collection
   */
  public disable(): void {
    this.isEnabled = false;
    this.configManager.setTelemetry(false).catch(error => {
      this.logger.error('Error disabling telemetry', error);
    });
  }

  /**
   * Check if telemetry is enabled
   */
  public isEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Track activation event
   */
  public trackExtensionActivation(isNewInstall: boolean): void {
    const activationProperties: ActivationEvent = {
      vscodeVersion: vscode.version,
      extensionVersion: this.extensionVersion,
      platform: process.platform,
      machineId: this.machineId,
      sessionId: this.sessionId,
      isNewInstall
    };

    this.trackEvent({
      type: TelemetryEventType.EXTENSION_ACTIVATED,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      properties: activationProperties
    });
  }

  /**
   * Track extension deactivation
   */
  public trackExtensionDeactivation(): void {
    this.trackEvent({
      type: TelemetryEventType.EXTENSION_DEACTIVATED,
      timestamp: Date.now(),
      sessionId: this.sessionId
    });

    // Flush any remaining events
    this.flush().catch(error => {
      this.logger.error('Error flushing telemetry events during deactivation', error);
    });
  }

  /**
   * Track command execution
   */
  public trackCommand(command: string, duration: number, success: boolean, errorMessage?: string): void {
    const commandProperties: CommandEvent = {
      command,
      duration,
      success,
      errorMessage
    };

    this.trackEvent({
      type: TelemetryEventType.COMMAND_EXECUTED,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      properties: commandProperties,
      measurements: {
        duration
      }
    });
  }

  /**
   * Track API request/response
   */
  public trackApiEvent(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    success: boolean,
    requestSize?: number,
    responseSize?: number
  ): void {
    const apiProperties: ApiEvent = {
      endpoint,
      method,
      statusCode,
      duration,
      success,
      requestSize,
      responseSize
    };

    this.trackEvent({
      type: TelemetryEventType.API_REQUEST,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      properties: apiProperties,
      measurements: {
        duration,
        requestSize: requestSize || 0,
        responseSize: responseSize || 0
      }
    });
  }

  /**
   * Setup the flush interval
   */
  private setupFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flushInterval = setInterval(() => {
      this.flush().catch(error => {
        this.logger.error('Error flushing telemetry events', error);
      });
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Get the extension version
   */
  private getExtensionVersion(): string {
    try {
      // This would typically come from the package.json
      return '0.1.0';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get a unique machine ID
   */
  private getMachineId(): string {
    // In a real implementation, we would use a persistent ID stored in workspace state
    // For now, generate a random ID
    return uuidv4();
  }

  /**
   * Dispose the telemetry service
   */
  public dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush any remaining events
    this.flush().catch(error => {
      this.logger.error('Error flushing telemetry events during disposal', error);
    });
  }
} 