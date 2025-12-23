'use client';

import React, { useMemo } from 'react';
import { format } from 'date-fns';
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
import type { Goal, Task } from '@/lib/types';
import { Trash2, CalendarDays, Loader } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import { cn } from '@/lib/utils';

type GoalCardProps = {
  goal: Goal;
  onDelete: () => void;
};

export function GoalCard({ goal, onDelete }: GoalCardProps) {

  const { progress, completedCount, totalCount } = useMemo(() => {
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
  }, [goal.tasks]);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    onDelete();
  };

  return (
    <Card className={cn(
        "flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card relative",
        goal.generatingTasks && "animate-pulse"
      )}>
      <div className="absolute top-2 right-2 z-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the goal "{goal.title}" and all its tasks. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Link href={`/goal/${goal.id}`} className="block h-full flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline pr-8">{goal.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2 h-[40px]">{goal.description}</CardDescription>
            {goal.deadline && (
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>Deadline: {format(new Date(goal.deadline), 'PPP')}</span>
              </div>
            )}
        </CardHeader>
        <CardContent className="flex-grow"></CardContent>
        <CardFooter className="flex-col items-start pt-4">
          {goal.generatingTasks ? (
            <div className="flex items-center text-sm text-muted-foreground w-full">
              <Loader className="w-4 h-4 text-primary animate-spin mr-2" />
              <span>Generating tasks...</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm text-muted-foreground mb-1 w-full">
                <span>Progress</span>
                <span>{completedCount} / {totalCount}</span>
              </div>
              <Progress value={progress} />
            </>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}
