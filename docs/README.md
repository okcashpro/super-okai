# OKai Support AI Documentation

Welcome to the OKai Support AI framework documentation! This guide explains how to create and integrate new personas and knowledge bases into your OKai-powered support system.

## Table of Contents

1. [Knowledge Bases](#knowledge-bases)
   - [Structure](#knowledge-base-structure)
   - [Components](#knowledge-base-components)
   - [Sample Q&As](#sample-qa-system)
   - [Pattern Matching](#pattern-matching)
   - [Example](#knowledge-base-example)
2. [Personas](#personas)
   - [Structure](#persona-structure)
   - [Components](#persona-components)
   - [Chat Length Modes](#chat-length-modes)
   - [Example](#persona-example)
3. [Best Practices](#best-practices)
   - [Knowledge Base Design](#knowledge-base-design)
   - [Persona Creation](#persona-creation)
   - [Integration Tips](#integration-tips)

## Knowledge Bases

Knowledge bases are the foundation of your AI support system. They contain structured information that personas can access and use to provide accurate responses.

### Knowledge Base Structure

Create a new file in `src/config/knowledge/` with a descriptive name (e.g., `crypto.ts`, `technology.ts`). The framework automatically loads and integrates all knowledge base files.

```typescript
import type { KnowledgeBase } from './types';

const knowledge: KnowledgeBase = {
  name: string;           // Display name of the knowledge base
  topics: {              // Categorized topic lists
    [category: string]: string[];
  };
  prompts: {             // Context-specific instructions
    [context: string]: string;
  };
  sampleQA?: {          // Q&As for pattern matching and responses
    [category: string]: {
      question: string;  // Question pattern to match
      answer: string;    // Verified response to provide
    }[];
  };
};

export default knowledge;
```

### Knowledge Base Components

1. **Name**: A descriptive identifier for the knowledge base
2. **Topics**: Categorized lists of subjects the knowledge base covers
3. **Prompts**: Context-specific instructions for using the knowledge
4. **Sample Q&As**: Pre-defined Q&As for pattern matching and consistent responses

### Sample Q&A System

The Q&A system enables accurate pattern matching and consistent responses:

```typescript
sampleQA: {
  category1: [
    {
      question: "How do I perform X?",
      answer: "Step-by-step instructions for X"
    }
  ]
}
```

The system automatically:
- Generates patterns from questions
- Weights domain-specific terms
- Matches user queries to the most relevant Q&A
- Ensures consistent, accurate responses

### Pattern Matching

The framework includes sophisticated pattern matching:

1. **Term Analysis**:
   - Extracts key terms from questions
   - Assigns weights to domain-specific terms
   - Handles variations in phrasing

2. **Intent Recognition**:
   - Identifies question types (how, what, why)
   - Matches action words (do, use, start)
   - Considers context and category

3. **Similarity Scoring**:
   - Calculates term overlap
   - Evaluates intent matches
   - Combines scores for best match

### Knowledge Base Example

```typescript
const knowledge: KnowledgeBase = {
  name: "Cryptocurrency",
  topics: {
    basics: [
      "Blockchain fundamentals",
      "Digital wallets",
      "Transaction basics"
    ]
  },
  prompts: {
    technical: `Explain technical concepts clearly with analogies`,
    support: `Guide users through common issues step-by-step`
  },
  sampleQA: {
    basics: [
      {
        question: "How do I create a wallet?",
        answer: "To create a wallet: 1) Download the official wallet app 2) Click 'New Wallet' 3) Follow the security setup steps"
      }
    ]
  }
};
```

## Personas

Personas are AI personalities that interact with users. Each persona has its own characteristics and can access specific knowledge bases.

### Persona Structure

Create a new file in `src/config/personas/` with a descriptive name. The framework automatically loads and integrates all persona files.

```typescript
import type { AIPersona } from './types';

const persona: AIPersona = {
  name: string;           // Display name of the persona
  description: string;    // Brief description of the persona
  systemPrompt: string;   // Detailed behavior instructions
  knowledgeBases?: string[]; // Knowledge bases to access
  customKnowledge?: string[]; // Additional specific knowledge
  displayOrder?: number;  // Optional display order in UI
  model?: string;        // Optional model override
  chatLength?: 'short' | 'normal' | 'long'; // Response length mode
};

export default persona;
```

### Persona Components

1. **Name**: The persona's display name
2. **Description**: Brief explanation of the persona's role
3. **System Prompt**: Detailed instructions for behavior and communication style
4. **Knowledge Bases**: Array of knowledge base names to access
5. **Custom Knowledge**: Additional specific knowledge topics
6. **Display Order**: Optional UI ordering (lower numbers appear first)
7. **Model**: Optional AI model override
8. **Chat Length**: Controls response verbosity

### Chat Length Modes

Personas support three response length modes:

1. **Short Mode**:
   - Concise, to-the-point responses
   - 1-2 sentences for simple queries
   - Focused on direct answers
   - Best for quick information

2. **Normal Mode** (Default):
   - Balanced response length
   - 2-4 paragraphs for complex topics
   - Includes relevant context
   - Suitable for most interactions

3. **Long Mode**:
   - Detailed, comprehensive responses
   - Extended explanations
   - Additional examples and context
   - Best for in-depth learning

Configure chat length in the persona definition:
```typescript
const persona: AIPersona = {
  // ... other properties
  chatLength: 'normal' // 'short' | 'normal' | 'long'
};
```

### Persona Example

```typescript
const persona: AIPersona = {
  name: "Tech Guide",
  description: "Friendly technical expert who explains complex concepts simply",
  systemPrompt: `You are a tech expert who loves making complex topics 
    accessible. Use analogies and real-world examples. Be friendly but 
    professional. Focus on clarity and practical applications.
    
    Response Length: Keep responses normal length, typically 2-3 paragraphs 
    when explaining technical concepts.`,
  knowledgeBases: ['technology', 'programming'],
  customKnowledge: [
    "Software development",
    "System architecture",
    "DevOps practices"
  ],
  displayOrder: 1,
  chatLength: 'normal'
};
```

## Best Practices

### Knowledge Base Design

1. **Organization**:
   - Use clear, logical categories
   - Keep topics focused and specific
   - Include comprehensive but concise information

2. **Sample Q&As**:
   - Write clear, specific questions
   - Include common variations
   - Provide detailed, accurate answers
   - Group related Q&As by category

3. **Pattern Matching**:
   - Include key terms in questions
   - Consider different phrasings
   - Test matching accuracy
   - Update based on user queries

### Persona Creation

1. **Personality**:
   - Define clear character traits
   - Maintain consistent communication style
   - Balance expertise with accessibility
   - Configure appropriate chat length

2. **Knowledge Integration**:
   - Choose relevant knowledge bases
   - Add specific expertise via customKnowledge
   - Consider knowledge combinations carefully

### Integration Tips

1. **File Organization**:
   - Use descriptive filenames
   - Follow the established structure
   - Keep files focused and modular

2. **Testing**:
   - Verify pattern matching
   - Test Q&A responses
   - Check persona behavior
   - Monitor matching accuracy

3. **Maintenance**:
   - Update Q&As regularly
   - Add new patterns as needed
   - Monitor user interactions
   - Refine based on feedback

## Need Help?

Join our community:
- Discord: [discord.gg/grvpc8c](https://discord.gg/grvpc8c)
- Telegram: [t.me/ok_heroes](https://t.me/ok_heroes)