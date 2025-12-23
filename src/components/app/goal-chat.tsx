
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Goal } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type GoalChatProps = {
  goal: Goal;
};

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export function GoalChat({ goal }: GoalChatProps) {
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
      const response = await (window as any).electron.chatWithGoal({
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
    <Sheet>
      <SheetTrigger asChild>
        <div className="fixed bottom-4 right-4 z-50">
          <Button className="rounded-full h-12 w-12 shadow-lg">
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Goal Assistant</SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-hidden flex flex-col mt-4">
          <ScrollArea className="flex-grow pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground mt-8">
                  <p>Ask me anything about your goal: <strong>{goal.title}</strong></p>
                  <p className="mt-2 text-xs">I can help you break down tasks, suggest resources, or provide code snippets.</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg text-sm max-w-[85%]",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-muted text-muted-foreground mr-auto"
                  )}
                >
                   <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
              {isLoading && (
                 <div className="text-sm text-muted-foreground ml-2 animate-pulse">Thinking...</div>
              )}
            </div>
          </ScrollArea>
          <div className="pt-4 mt-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
