import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { marked } from 'marked';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
  shouldAnimate?: boolean;
  isLoadedMessage?: boolean; // New prop to identify loaded messages
  onContentUpdate?: () => void;
  onAnimationComplete?: () => void;
}

export function ChatMessage({ 
  message, 
  isTyping = false, 
  shouldAnimate = false,
  isLoadedMessage = false, // Default to false for new messages
  onContentUpdate,
  onAnimationComplete 
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (isUser || !shouldAnimate || isLoadedMessage) {
      setDisplayedContent(message.content);
      onAnimationComplete?.();
      return;
    }

    setIsAnimating(true);
    const words = message.content.split(/(\s+)/);
    let currentText = '';
    let currentIndex = 0;

    const typeNextWord = () => {
      if (currentIndex < words.length) {
        currentText += words[currentIndex];
        setDisplayedContent(currentText);
        onContentUpdate?.();
        currentIndex++;
        animationRef.current = requestAnimationFrame(typeNextWord);
      } else {
        setIsAnimating(false);
        onAnimationComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(typeNextWord);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnimating(false);
    };
  }, [isUser, message.content, shouldAnimate, isLoadedMessage, onContentUpdate, onAnimationComplete]);

  const htmlContent = marked(displayedContent, { breaks: true });
  
  return (
    <div className={`p-4 ${isUser ? 'bg-gray-800' : 'bg-gray-900'}`}>
      <div className="max-w-4xl mx-auto flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          {isUser ? (
            <MessageSquare className="h-6 w-6 text-gray-300" />
          ) : (
            <Bot className="h-6 w-6 text-blue-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div 
            className="text-gray-100 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          {(isAnimating || isTyping) && (
            <div className="typing-indicator" data-testid="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}