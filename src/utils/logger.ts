import * as vscode from 'vscode';
import { LogLevel } from '../types/common';

/**
 * Logger class for the M31-Agents extension
 */
export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel = LogLevel.INFO;
  private readonly serviceName = 'M31-Agents';

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel(this.serviceName);
  }

  /**
   * Get the singleton instance of the Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set the log level
   * @param level The log level to set
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info(`Log level set to ${level}`);
  }

  /**
   * Get the current log level
   * @returns The current log level
   */
  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param context Optional context object
   */
  public debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param context Optional context object
   */
  public info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, context);
    }
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param context Optional context object
   */
  public warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, context);
    }
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param error Optional error object
   * @param context Optional context object
   */
  public error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = error instanceof Error
        ? { 
            name: error.name, 
            message: error.message, 
            stack: error.stack,
            ...context
          }
        : { error, ...context };
      
      this.log(LogLevel.ERROR, message, errorContext);
    }
  }

  /**
   * Clear the log output channel
   */
  public clear(): void {
    this.outputChannel.clear();
  }

  /**
   * Show the log output channel
   */
  public show(): void {
    this.outputChannel.show();
  }

  /**
   * Dispose the logger resources
   */
  public dispose(): void {
    this.outputChannel.dispose();
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    this.outputChannel.appendLine(formattedMessage);
    
    if (context) {
      this.outputChannel.appendLine(JSON.stringify(context, null, 2));
    }
    
    // Also output to console for development purposes
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = this.getConsoleMethod(level);
      consoleMethod(formattedMessage);
      if (context) {
        console.dir(context, { depth: null });
      }
    }
  }

  /**
   * Determine if a message at the given level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const logLevelIndex = levels.indexOf(level);
    
    return logLevelIndex <= currentLevelIndex;
  }

  /**
   * Get the appropriate console method for the log level
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }
} 