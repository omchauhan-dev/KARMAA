
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { LogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle, Calendar as CalendarIcon, BookOpen, Hammer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FocusModeToggle } from '@/components/app/focus-mode';

type AppHeaderProps = {
  onAddGoal: (title: string, description: string, type: 'learn' | 'build', deadline?: Date) => Promise<void>;
};

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Goal title must be at least 3 characters.',
  }),
  description: z.string().optional(),
  deadline: z.date().optional(),
  type: z.enum(['learn', 'build'], {
    required_error: "You need to select a goal type.",
  }),
});


export function AppHeader({ onAddGoal }: AppHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: undefined,
      type: 'learn',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await onAddGoal(values.title, values.description || '', values.type, values.deadline);
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-headline tracking-tight">
              Karma
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <FocusModeToggle />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a New Goal</DialogTitle>
                <DialogDescription>
                  What new objective do you want to accomplish? Define its details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>I want to...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="learn" id="learn" className="peer sr-only" />
                              </FormControl>
                              <FormLabel
                                htmlFor="learn"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-32"
                              >
                                <BookOpen className="mb-2 h-6 w-6" />
                                Learn
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="build" id="build" className="peer sr-only" />
                              </FormControl>
                              <FormLabel
                                htmlFor="build"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-32"
                              >
                                <Hammer className="mb-2 h-6 w-6" />
                                Build
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Learn Next.js" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., A brief summary of why this goal is important."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Deadline (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                      </DialogClose>
                    <Button type="submit">Create Goal</Button>
                  </DialogFooter>
                </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
}
