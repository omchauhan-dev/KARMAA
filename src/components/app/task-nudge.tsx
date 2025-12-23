
'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Goal } from '@/lib/types';

export function TaskNudge({ goal }: { goal: Goal }) {
  const { toast } = useToast();
  const [hasNudged, setHasNudged] = useState(false);

  useEffect(() => {
    const incompleteTasks = goal.tasks.filter(t => !t.completed).length;
    if (incompleteTasks > 0 && !hasNudged) {
        // Simple heuristic: nudge after 5 seconds of being on the page if tasks are pending
        const timer = setTimeout(async () => {
            try {
                const result = await (window as any).electron.generateNudge({ goalTitle: goal.title, incompleteTasksCount: incompleteTasks });
                if (result && result.message) {
                    toast({
                        title: "Task Reminder",
                        description: result.message,
                    });
                    setHasNudged(true);
                }
            } catch (error) {
                console.error("Failed to generate nudge", error);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [goal, hasNudged, toast]);

  return null;
}
