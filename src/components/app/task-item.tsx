
'use client';

import React, { useState, useMemo } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Task } from '@/lib/types';
import { ChevronRight, Plus, Trash2, Link as LinkIcon, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TaskItemProps = {
  task: Task;
  level: number;
  onUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAddSubTask: (parentId: string, title: string) => void;
};

const YoutubeVideoEmbed = ({ url }: { url: string }) => {
  try {
    const urlObj = new URL(url);
    let videoId = urlObj.searchParams.get('v');
    if (!videoId && urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    }
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
      <iframe
        width="100%"
        height="315"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-md"
      ></iframe>
    );
  } catch (error) {
    console.error("Invalid video URL", error);
    return null;
  }
};

export function TaskItem({ task, level, onUpdate, onDelete, onAddSubTask }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { videoSources, linkSources } = useMemo(() => {
    const videos: string[] = [];
    const links: string[] = [];
    if (task.sources) {
      task.sources.forEach(source => {
        if (source.includes('youtube.com/') || source.includes('youtu.be/')) {
          videos.push(source);
        } else {
          links.push(source);
        }
      });
    }
    return { videoSources: videos, linkSources: links };
  }, [task.sources]);

  const handleTitleUpdate = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.trim() !== '' && e.currentTarget.value !== task.title) {
      onUpdate(task.id, { title: e.currentTarget.value });
    }
    setIsEditing(false);
  };
  
  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim() !== '') {
      onAddSubTask(task.id, newSubTaskTitle);
      setNewSubTaskTitle('');
      setIsAdding(false);
    }
  };

  return (
    <TooltipProvider>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/task">
        <div 
          className="flex items-center gap-2 rounded-md hover:bg-accent transition-colors"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
            </Button>
          </CollapsibleTrigger>
          <Checkbox
            id={task.id}
            checked={task.completed}
            onCheckedChange={(checked) => onUpdate(task.id, { completed: !!checked })}
            className="shrink-0"
          />
          {isEditing ? (
            <Input
              defaultValue={task.title}
              onBlur={handleTitleUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate(e)}
              autoFocus
              className="h-8"
            />
          ) : (
            <span 
              className={cn("flex-grow cursor-pointer p-1", task.completed && "line-through text-muted-foreground")}
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </span>
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setIsAdding(true); setIsOpen(true); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Add sub-task</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Delete task</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
        <CollapsibleContent style={{ paddingLeft: `${(level + 1) * 1.5 + 0.5}rem` }} className="py-2 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Instructions</label>
            <Textarea
              placeholder="Add detailed instructions or resources..."
              value={task.instructions}
              onChange={(e) => onUpdate(task.id, { instructions: e.target.value })}
              className="mt-1"
            />
          </div>

          {videoSources.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                <Youtube className="h-4 w-4 mr-2" />
                Videos
              </h4>
              <div className="space-y-3">
                {videoSources.map((source, index) => (
                  <YoutubeVideoEmbed key={index} url={source} />
                ))}
              </div>
            </div>
          )}

          {linkSources.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                <LinkIcon className="h-4 w-4 mr-2" />
                Sources
              </h4>
              <div className="space-y-2">
                {linkSources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate">{source}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {task.subTasks.map((subTask) => (
              <TaskItem
                key={subTask.id}
                task={subTask}
                level={level + 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddSubTask={onAddSubTask}
              />
            ))}
          </div>
          
          {isAdding && (
            <div className="flex gap-2">
              <Input
                placeholder="New sub-task title..."
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                autoFocus
                className="h-9"
              />
              <Button onClick={handleAddSubTask} size="sm">Add</Button>
              <Button onClick={() => setIsAdding(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </TooltipProvider>
  );
}
