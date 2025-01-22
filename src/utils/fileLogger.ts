import { logger } from './logger';
import type { Message } from '../types';

interface ConversationLog {
  id: string;
  timestamp: number;
  messages: Message[];
  persona: string;
}

export class FileLogger {
  private static instance: FileLogger;
  private readonly storageKey = 'super_okai_logs';
  private readonly maxLogs = 1000; // Prevent excessive storage usage

  private constructor() {
    this.cleanupOldLogs();
  }

  static getInstance(): FileLogger {
    if (!this.instance) {
      this.instance = new FileLogger();
    }
    return this.instance;
  }

  private getLogs(): ConversationLog[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Error reading logs:', error);
      return [];
    }
  }

  private saveLogs(logs: ConversationLog[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      logger.error('Error saving logs:', error);
      // If storage is full, remove oldest logs
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const currentLogs = this.getLogs();
        const reducedLogs = currentLogs.slice(-Math.floor(this.maxLogs / 2));
        localStorage.setItem(this.storageKey, JSON.stringify(reducedLogs));
      }
    }
  }

  logConversation(messages: Message[], persona: string): void {
    try {
      const log: ConversationLog = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        messages,
        persona
      };

      const logs = this.getLogs();
      logs.push(log);

      // Keep only the latest logs
      if (logs.length > this.maxLogs) {
        logs.splice(0, logs.length - this.maxLogs);
      }

      this.saveLogs(logs);
      logger.info('Conversation logged', { id: log.id });
    } catch (error) {
      logger.error('Error logging conversation:', error);
    }
  }

  private formatConversation(log: ConversationLog): string {
    const date = new Date(log.timestamp).toISOString();
    let content = `Conversation ID: ${log.id}\n`;
    content += `Date: ${date}\n`;
    content += `Persona: ${log.persona}\n`;
    content += `\n--- Messages ---\n\n`;

    log.messages.forEach((msg, index) => {
      const role = msg.role === 'assistant' ? log.persona : 'USER';
      content += `[${role}]: ${msg.content}\n`;
      if (index < log.messages.length - 1) {
        content += '\n';
      }
    });

    return content;
  }

  downloadAllLogs(): void {
    try {
      const logs = this.getLogs();
      const content = logs
        .map(log => this.formatConversation(log))
        .join('\n\n' + '='.repeat(80) + '\n\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `super-okai-logs-${new Date().toISOString()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Error downloading logs:', error);
    }
  }

  cleanupOldLogs(daysToKeep = 30): void {
    try {
      const logs = this.getLogs();
      const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      
      const filteredLogs = logs.filter(log => log.timestamp >= cutoffDate);
      
      if (filteredLogs.length < logs.length) {
        this.saveLogs(filteredLogs);
        logger.info(`Cleaned up ${logs.length - filteredLogs.length} old logs`);
      }
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  clearAllLogs(): void {
    try {
      localStorage.removeItem(this.storageKey);
      logger.info('All logs cleared');
    } catch (error) {
      logger.error('Error clearing logs:', error);
    }
  }
}

export const fileLogger = FileLogger.getInstance();