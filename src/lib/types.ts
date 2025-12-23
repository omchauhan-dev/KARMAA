export type Task = {
  id: string;
  title: string;
  instructions: string;
  completed: boolean;
  subTasks: Task[];
  generating?: boolean;
  sources?: string[];
};

export type Goal = {
  id:string;
  title: string;
  description: string;
  deadline?: string;
  type?: 'learn' | 'build';
  tasks: Task[];
  generatingTasks?: boolean;
};
