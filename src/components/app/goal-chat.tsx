
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithGoal } from '@/ai/flows/chat-flow';
import type { Goal } from '@/lib/types';
import { cn } from '@/lib/utils';

type GoalChatProps = {
  goal: Goal;
};

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export function GoalChat({ goal }: GoalChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithGoal({
        message: userMessage,
        goalContext: {
          title: goal.title,
          description: goal.description,
          tasks: goal.tasks, // Pass tasks context
        },
      });
      
      if (response && response.reply) {
          setMessages(prev => [...prev, { role: 'ai', content: response.reply }]);
      }
    } catch (error) {
      console.error("Chat failed", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process that request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 h-96 shadow-xl mb-4 flex flex-col">
          <CardHeader className="p-3 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-medium">Goal Assistant</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col overflow-hidden">
            <ScrollArea className="flex-grow p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-xs text-muted-foreground mt-4">
                  Ask me anything about your goal!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "mb-2 p-2 rounded-lg text-sm max-w-[85%]",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-muted text-muted-foreground mr-auto"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                 <div className="text-xs text-muted-foreground ml-2 animate-pulse">Thinking...</div>
              )}
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="h-8 text-sm"
              />
              <Button size="icon" className="h-8 w-8" onClick={handleSend} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-12 w-12 shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}
