
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { produce } from 'immer';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import type { Goal, Task } from '@/lib/types';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TaskItem } from '@/components/app/task-item';
import { MindMapView } from '@/components/app/mind-map-view';
import { ArrowLeft, Plus, CalendarDays, Bot, Loader, RefreshCw, List, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UpgradeDialog } from '@/components/app/upgrade-dialog';
import { ExportButton } from '@/components/app/export-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoalChat } from '@/components/app/goal-chat';
import { TaskNudge } from '@/components/app/task-nudge';
import { QRCodeShare } from '@/components/app/qr-code-share';

// Helper function to add unique IDs to tasks and subtasks
const addIdsToTasks = (tasks: Omit<Task, 'id' | 'completed' | 'subTasks'> & { subTasks: any[] }[]): Task[] => {
  return tasks.map(task => ({
    ...task,
    id: crypto.randomUUID(),
    completed: false,
    instructions: task.instructions || '',
    sources: task.sources || [],
    subTasks: task.subTasks ? addIdsToTasks(task.subTasks) : [],
  }));
};

export default function GoalDetailPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const goalId = params.id as string;

  useEffect(() => {
    setIsClient(true);
    if (goalId) {
      try {
        const storedGoals = localStorage.getItem('progress-pillars-goals');
        if (storedGoals) {
          const goals: Goal[] = JSON.parse(storedGoals);
          const currentGoal = goals.find(g => g.id === goalId);
          if (currentGoal) {
            setGoal(currentGoal);
          } else {
            navigate('/'); // Goal not found
          }
        }
      } catch (error) {
        console.error("Failed to load goal from localStorage", error);
        navigate('/');
      }
    }
  }, [goalId, navigate]);

  const updateGlobalGoals = (updater: (draft: Goal[]) => void) => {
    try {
        const storedGoals = localStorage.getItem('progress-pillars-goals');
        const goals = storedGoals ? JSON.parse(storedGoals) : [];
        const newGoals = produce(goals, updater);
        localStorage.setItem('progress-pillars-goals', JSON.stringify(newGoals));
        return newGoals;
    } catch (error) {
        console.error("Could not save to localStorage.", error);
        return null;
    }
  }

  const handleUpdate = useCallback((updater: (draft: Goal) => void) => {
    if (!goal) return;
    const newGoal = produce(goal, updater);
    setGoal(newGoal);

    updateGlobalGoals(draft => {
        const goalIndex = draft.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
            draft[goalIndex] = newGoal;
        }
    });
  }, [goal, goalId]);

  const updateTask = useCallback((taskId: string, updatedTask: Partial<Task>) => {
    handleUpdate(draft => {
      const findAndApply = (tasks: Task[]): boolean => {
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].id === taskId) {
            tasks[i] = { ...tasks[i], ...updatedTask };
            return true;
          }
          if (tasks[i].subTasks && findAndApply(tasks[i].subTasks)) return true;
        }
        return false;
      };
      findAndApply(draft.tasks);
    });
  }, [handleUpdate]);

  const addSubTask = useCallback((parentId: string, title: string) => {
    handleUpdate(draft => {
      const findAndAdd = (tasks: Task[]): boolean => {
        for (const task of tasks) {
          if (task.id === parentId) {
            const newTask: Task = { id: crypto.randomUUID(), title, instructions: '', completed: false, subTasks: [] };
            task.subTasks.push(newTask);
            return true;
          }
          if (task.subTasks && findAndAdd(task.subTasks)) return true;
        }
        return false;
      };
      findAndAdd(draft.tasks);
    });
  }, [handleUpdate]);

  const deleteTask = useCallback((taskId: string) => {
    handleUpdate(draft => {
      const remover = (tasks: Task[]): Task[] => {
        return tasks
          .filter(task => task.id !== taskId)
          .map(task => ({ ...task, subTasks: remover(task.subTasks) }));
      };
      draft.tasks = remover(draft.tasks);
    });
  }, [handleUpdate]);
  
  const addTopLevelTask = () => {
    if (!goal) return;
    if (goal.tasks.length >= 3) {
      setShowUpgradeDialog(true);
      return;
    }
    const title = `New Task ${goal.tasks.length + 1}`;
    const newTask: Task = { id: crypto.randomUUID(), title, instructions: '', completed: false, subTasks: [] };
    handleUpdate(draft => {
      draft.tasks.unshift(newTask);
    });
  };

  const regenerateTasks = async () => {
    if (!goal) return;
    handleUpdate(draft => {
        draft.generatingTasks = true;
        draft.tasks = [];
    });
    
    try {
      const type = goal.type || 'learn';
      const result = await (window as any).electron.generateTasks({ title: goal.title, description: goal.description, type });
      const tasksWithIds = addIdsToTasks(result.tasks || []);
      handleUpdate(draft => {
          draft.tasks = tasksWithIds;
          draft.generatingTasks = false;
      });
    } catch (error) {
      console.error("Failed to re-generate tasks:", error);
       toast({
        variant: "destructive",
        title: "AI Task Generation Failed",
        description: "Could not re-generate tasks for the goal. Previous tasks have been restored.",
      })
      // Restore previous tasks on failure
      handleUpdate(draft => {
          draft.generatingTasks = false;
      });
    }
  };

  const { progress, completedCount, totalCount } = useMemo(() => {
    if (!goal) return { progress: 0, completedCount: 0, totalCount: 0 };
    const counter = (tasks: Task[]): { total: number; completed: number } => {
      let total = 0;
      let completed = 0;
      tasks.forEach(task => {
        total += 1;
        if (task.completed) completed += 1;
        const subCounts = counter(task.subTasks);
        total += subCounts.total;
        completed += subCounts.completed;
      });
      return { total, completed };
    };

    const { total, completed } = counter(goal.tasks);
    return {
      progress: total > 0 ? (completed / total) * 100 : 0,
      completedCount: completed,
      totalCount: total,
    };
  }, [goal]);

  if (!isClient || !goal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <GoalChat goal={goal} />
      <TaskNudge goal={goal} />
      <UpgradeDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog} />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
              <Button asChild variant="outline">
                  <Link to="/">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Dashboard
                  </Link>
              </Button>
          </div>
          <Card className="flex flex-col h-full shadow-lg bg-card">
            <CardHeader>
              <div className="flex-1">
                <CardTitle className="font-headline text-3xl">{goal.title}</CardTitle>
                <CardDescription className="mt-2 text-base">{goal.description}</CardDescription>
                {goal.deadline && (
                  <div className="mt-3 flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>Deadline: {format(new Date(goal.deadline), 'PPP')}</span>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <div className="flex justify-end mb-2 gap-2">
                    <QRCodeShare goalId={goal.id} title={goal.title} />
                    <ExportButton elementId="goal-content" goalTitle={goal.title} />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{completedCount} / {totalCount}</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2" id="goal-content">
              <div className="flex justify-end mb-4">
                <div className="bg-muted p-1 rounded-md flex items-center">
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className="h-8 w-8 p-0"
                  >
                    <Network className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {goal.generatingTasks ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <Loader className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground font-semibold">Generating tasks with AI...</p>
                </div>
              ) : goal.tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <Bot className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No tasks generated yet.</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">You can add tasks manually below.</p>
                </div>
              ) : viewMode === 'list' ? (
                goal.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    level={0}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onAddSubTask={addSubTask}
                  />
                ))
              ) : (
                <MindMapView tasks={goal.tasks} goalTitle={goal.title} />
              )}
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              <Button variant="secondary" className="w-full" onClick={addTopLevelTask}>
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
              <Button variant="outline" className="w-full" onClick={regenerateTasks}>
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
