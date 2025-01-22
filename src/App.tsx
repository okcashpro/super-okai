import React, { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { PersonaSidebar } from './components/PersonaSidebar';
import { usePersona } from './hooks/usePersona';
import { useChatFocusProvider, ChatFocusContext } from './hooks/useChatFocus';
import { useKnowledgeReload } from './hooks/useKnowledgeReload';
import { useChatScroll } from './hooks/useChatScroll';
import { sendMessage } from './api';
import { Github, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from './types';
import { APIError } from './utils/errors';
import { config } from './config/env';

export default function App() {
  useKnowledgeReload();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const { currentPersona, changePersona, availablePersonas } = usePersona();
  const chatFocus = useChatFocusProvider();
  const { scrollContainerRef, messagesEndRef, handleContentUpdate } = 
    useChatScroll({ messages, isTyping: isLoading });

  // Check configuration on mount
  useEffect(() => {
    if (!config.openRouterApiKey) {
      setConfigError('OpenRouter API key is missing. Please check your .env file configuration.');
    }
  }, []);

  const handlePersonaChange = useCallback((personaKey: string) => {
    changePersona(personaKey);
    setMessages([]);
    chatFocus.focusInput();
  }, [changePersona, chatFocus]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { id: uuidv4(), role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiMessages = messages.concat(userMessage);
      const response = await sendMessage(apiMessages, currentPersona);
      
      if (response) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          role: 'assistant',
          content: response.content || 'Sorry, I could not generate a response.'
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Sorry, there was an error processing your request.';
      
      if (error instanceof APIError && error.statusCode === 401) {
        errorMessage = 'API key is invalid or missing. Please check your .env file configuration.';
        setConfigError(errorMessage);
      }
      
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatFocusContext.Provider value={chatFocus}>
      <div className="flex flex-col h-full bg-gray-900">
        <header className="flex-none p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white text-center">Super Okai</h1>
          {configError && (
            <div className="mt-2 p-3 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2 text-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{configError}</p>
            </div>
          )}
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 min-h-[200px]">
                  <p>Start a conversation with {currentPersona.name} by typing a message below.</p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id}
                      message={message}
                      isTyping={isLoading && message === messages[messages.length - 1]}
                      shouldAnimate={message.role === 'assistant'}
                      onContentUpdate={handleContentUpdate}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </main>

          <PersonaSidebar
            personas={availablePersonas}
            currentPersona={currentPersona}
            onPersonaChange={handlePersonaChange}
          />
        </div>

        <footer className="flex-none border-t border-gray-800">
          <div className="max-w-4xl mx-auto w-full">
            <ChatInput onSend={handleSendMessage} disabled={isLoading || !!configError} />
            <div className="px-4 pb-2 flex justify-between items-center text-xs text-gray-500">
              <span>
                <a href="https://super-okai.github.io" className="hover:text-blue-400 transition-colors">Super Okai</a>
                {' '}by{' '}
                <a href="https://okcash.org" className="hover:text-blue-400 transition-colors">OK</a>
                {' '}© 2025
              </span>
              <a
                href="https://github.com/ok-devs/super-okai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs mr-5"
              >
                <Github className="h-3.5 w-3.5" />
                <span>Use me for your project</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </ChatFocusContext.Provider>
  );
}