import { Message } from '../types';
import { logger } from './logger';

interface StoredConversations {
  [personaName: string]: Message[];
}

class ConversationStore {
  private static instance: ConversationStore;
  private readonly storageKey = 'super_okai_conversations';

  private constructor() {}

  static getInstance(): ConversationStore {
    if (!this.instance) {
      this.instance = new ConversationStore();
    }
    return this.instance;
  }

  getConversation(personaName: string): Message[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const conversations: StoredConversations = JSON.parse(stored);
      return conversations[personaName] || [];
    } catch (error) {
      logger.error('Error reading conversation:', error);
      return [];
    }
  }

  saveConversation(personaName: string, messages: Message[]): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const conversations: StoredConversations = stored ? JSON.parse(stored) : {};
      
      conversations[personaName] = messages;
      localStorage.setItem(this.storageKey, JSON.stringify(conversations));
    } catch (error) {
      logger.error('Error saving conversation:', error);
    }
  }

  clearConversation(personaName: string): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const conversations: StoredConversations = JSON.parse(stored);
      delete conversations[personaName];
      localStorage.setItem(this.storageKey, JSON.stringify(conversations));
    } catch (error) {
      logger.error('Error clearing conversation:', error);
    }
  }

  clearAllConversations(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      logger.error('Error clearing all conversations:', error);
    }
  }
}

export const conversationStore = ConversationStore.getInstance();