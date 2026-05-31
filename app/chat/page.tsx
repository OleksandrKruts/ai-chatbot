"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useChat } from "@/lib/useChat";

const SUGGESTIONS = [
  "Explain how LLMs work in simple terms",
  "Write a Python function to fetch data from an API",
  "What is prompt engineering?",
  "Help me debug this code: console.log('hello'",
];

const SYSTEM_PROMPT = `You are a helpful AI assistant for developers. 
Be concise, use code examples when relevant, and always explain your reasoning.`;

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage, reset } =
    useChat(SYSTEM_PROMPT);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="white"
              className="opacity-90"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              AI Chatbot
            </h1>
            <p className="text-xs text-gray-500">powered by Claude</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          New chat
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div>
              <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-1">
                How can I help you?
              </h2>
              <p className="text-sm text-gray-500">
                Ask me anything — I&apos;m here to assist.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-4 py-2 rounded-lg">
            Error: {error}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
        />
        <p className="text-center text-xs text-gray-400 pb-2">
          Claude can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
