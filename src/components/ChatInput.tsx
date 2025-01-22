import React, { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useChatFocus } from '../hooks/useChatFocus';

interface ChatInputProps {
  onSend: (message: string) => void;
  onClear: () => void;
  disabled: boolean;
}

export function ChatInput({ onSend, onClear, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const { inputRef, focusInput } = useChatFocus();

  // Auto-focus when disabled state changes from true to false (after AI responds)
  useEffect(() => {
    if (!disabled) {
      focusInput();
    }
  }, [disabled, focusInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className="p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          title="Clear current conversation"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}