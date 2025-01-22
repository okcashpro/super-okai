export type ChatLength = 'short' | 'normal' | 'long';

export interface AIPersona {
  name: string;
  description: string;
  systemPrompt: string;
  knowledgeBases?: string[];
  customKnowledge?: string[];
  displayOrder?: number;
  model?: string;
  chatLength?: ChatLength; // New property for controlling response length
}

export interface PersonaConfig {
  [key: string]: AIPersona;
}