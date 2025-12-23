
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Focus, Minimize2, Code, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type FocusModeContextType = {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
};

export const FocusModeContext = React.createContext<FocusModeContextType>({
  isFocusMode: false,
  toggleFocusMode: () => {},
});

export const useFocusMode = () => React.useContext(FocusModeContext);

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleFocusMode = () => setIsFocusMode(!isFocusMode);

  return (
    <FocusModeContext.Provider value={{ isFocusMode, toggleFocusMode }}>
      <div className={cn("transition-all duration-300", isFocusMode && "bg-background/95")}>
        {children}
        {isFocusMode && (
          <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-card border shadow-lg rounded-full p-2 flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-destructive" onClick={toggleFocusMode}>
                                <Minimize2 className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Exit Focus Mode</TooltipContent>
                    </Tooltip>
                    <div className="h-6 w-px bg-border mx-1" />
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => (window as any).electron.openExternal('vscode://')}>
                                <Code className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                         <TooltipContent>Open VS Code</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             </div>
          </div>
        )}
      </div>
    </FocusModeContext.Provider>
  );
}

export function FocusModeToggle() {
    const { isFocusMode, toggleFocusMode } = useFocusMode();
    
    if (isFocusMode) return null; // Hide toggle when active (exit button is floating)

    return (
        <Button variant="outline" size="sm" onClick={toggleFocusMode}>
            <Focus className="mr-2 h-4 w-4" />
            Focus Mode
        </Button>
    )
}
