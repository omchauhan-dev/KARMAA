
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import type { Goal } from '@/lib/types';
import { initialGoals } from '@/lib/initial-data';
import { AppHeader } from '@/components/app/header';
import { GoalCard } from '@/components/app/goal-card';
import { Target, Loader } from 'lucide-react';
import { generateTasksForGoal } from '@/ai/flows/generate-tasks-flow';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { UpgradeDialog } from '@/components/app/upgrade-dialog';

// Helper function to add unique IDs to tasks and subtasks
const addIdsToTasks = (tasks: Omit<any, 'id' | 'completed' | 'subTasks'> & { subTasks: any[] }[]): any[] => {
  return tasks.map(task => ({
    ...task,
    id: crypto.randomUUID(),
    completed: false,
    instructions: task.instructions || '',
    sources: task.sources || [],
    subTasks: task.subTasks ? addIdsToTasks(task.subTasks) : [],
  }));
};

function HomePageContent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Prevent hydration errors by only setting initial state on the client
    setIsClient(true);
    try {
      const storedGoals = localStorage.getItem('progress-pillars-goals');
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      } else {
        setGoals(initialGoals);
      }
    } catch (error) {
      console.error("Could not access localStorage, falling back to initial data.", error);
      setGoals(initialGoals);
    }
  }, []);
  
  const addGoal = useCallback(async (title: string, description: string, deadline?: Date) => {
    if (goals.length >= 3) {
      setShowUpgradeDialog(true);
      return;
    }

    const newGoalStub: Goal = {
      id: crypto.randomUUID(),
      title,
      description,
      deadline: deadline?.toISOString(),
      tasks: [],
      generatingTasks: true,
    };
    
    // Immediately update state with the stub
    const updatedGoalsWithStub = [newGoalStub, ...goals];
    setGoals(updatedGoalsWithStub);
     try {
      localStorage.setItem('progress-pillars-goals', JSON.stringify(updatedGoalsWithStub));
    } catch (error) {
        console.error("Could not save to localStorage.", error);
    }

    const generationPromise = generateTasksForGoal({ title, description });


    try {
      const result = await generationPromise;
      const tasksWithIds = addIdsToTasks(result.tasks || []);
      
      let finalDeadline: string | undefined;
      if (deadline) {
        finalDeadline = deadline.toISOString();
      } else if (result.suggestedDeadline) {
        let suggestedDate = new Date(result.suggestedDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        if (suggestedDate < today) {
          // If the suggested date is in the past, set it to one week from now.
          suggestedDate = new Date();
          suggestedDate.setDate(suggestedDate.getDate() + 7);
        }
        finalDeadline = suggestedDate.toISOString();
      }

      const newGoal = { ...newGoalStub, tasks: tasksWithIds, generatingTasks: false, deadline: finalDeadline };
      
      setGoals((prevGoals) => {
        const newGoalsList = prevGoals.map(g => g.id === newGoal.id ? newGoal : g);
        localStorage.setItem('progress-pillars-goals', JSON.stringify(newGoalsList));
        return newGoalsList;
      });
      
      // Redirect to the new goal's detail page
      router.push(`/goal/${newGoal.id}`);

    } catch (error) {
      console.error("Failed to generate tasks:", error);
       toast({
        variant: "destructive",
        title: "AI Task Generation Failed",
        description: "Could not generate tasks for the new goal. Please add them manually.",
      })
      const newGoal = { ...newGoalStub, generatingTasks: false };
       setGoals((prevGoals) => {
        const newGoalsList = prevGoals.map(g => g.id === newGoal.id ? newGoal : g);
        localStorage.setItem('progress-pillars-goals', JSON.stringify(newGoalsList));
        return newGoalsList;
      });
       // Still redirect, user can add tasks manually
      router.push(`/goal/${newGoal.id}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, router, toast]);

  useEffect(() => {
    if (isClient && goals.length > 0) { // Only save if there are goals
      try {
        localStorage.setItem('progress-pillars-goals', JSON.stringify(goals));
      } catch (error) {
        console.error("Could not save to localStorage.", error);
      }
    }
  }, [goals, isClient]);


  const deleteGoal = (id: string) => {
    setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
  };
  
  if (!isClient) {
    // Render a skeleton or loading state on the server to avoid flash of empty content
    return (
       <div className="flex flex-col min-h-screen bg-background">
        <AppHeader onAddGoal={addGoal} />
        <main className="flex-grow container mx-auto p-4 md:p-8">
           <div className="flex flex-col items-center justify-center text-center h-full py-20">
              <Loader className="w-8 h-8 animate-spin text-primary" />
              <h2 className="text-2xl font-semibold text-muted-foreground font-headline mt-4">Loading Goals...</h2>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <UpgradeDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog} limitType="goal" />
      <AppHeader onAddGoal={addGoal} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal}
                onDelete={() => deleteGoal(goal.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full py-20">
            <Target className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-muted-foreground font-headline">No goals yet.</h2>
            <p className="mt-2 text-muted-foreground">Click "Add New Goal" to get started on a new objective.</p>
          </div>
        )}
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>Built with Karma</p>
      </footer>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  )
}
