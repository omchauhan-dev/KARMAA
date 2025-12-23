
import type { Goal } from './types';

export const initialGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Learn Next.js',
    description: 'Master the fundamentals and advanced concepts of Next.js for building modern web applications.',
    deadline: '2025-06-20T00:00:00.000Z',
    tasks: [
      {
        id: 'task-1-1',
        title: 'Day 1: Basics',
        instructions: 'Go through the official Next.js documentation tutorial. Understand pages, components, and routing.',
        completed: true,
        sources: ['https://nextjs.org/docs'],
        subTasks: [
          {
            id: 'task-1-1-1',
            title: 'Setup Project',
            instructions: 'Use `create-next-app` to initialize a new project.',
            completed: true,
            sources: ['https://nextjs.org/docs/getting-started/installation'],
            subTasks: [],
          },
          {
            id: 'task-1-1-2',
            title: 'Create First Page',
            instructions: 'Build a simple "Hello, World!" page.',
            completed: true,
            subTasks: [],
          },
        ],
      },
      {
        id: 'task-1-2',
        title: 'Day 2: App Router',
        instructions: 'Dive into the App Router, layouts, and server components.',
        completed: false,
        sources: ['https://nextjs.org/docs/app'],
        subTasks: [
          {
            id: 'task-1-2-1',
            title: 'Understand Server Components',
            instructions: 'Read about the benefits and usage of Server Components.',
            completed: true,
            subTasks: [],
          },
          {
            id: 'task-1-2-2',
            title: 'Implement Nested Layouts',
            instructions: 'Create a dashboard layout with a sidebar.',
            completed: false,
            subTasks: [],
          },
        ],
      },
      {
        id: 'task-1-3',
        title: 'Day 3: Data Fetching & Deployment',
        instructions: 'Learn different data fetching strategies and deploy the app.',
        completed: false,
        subTasks: [],
      },
    ],
  },
  {
    id: 'goal-2',
    title: 'Plan a Garden',
    description: 'Design and plan a vegetable garden for the upcoming spring season.',
    tasks: [
        {
            id: 'task-2-1',
            title: 'Chapter 1: Research',
            instructions: 'Determine which plants grow best in the local climate.',
            completed: false,
            sources: ['https://www.almanac.com/gardening/planting-calendar'],
            subTasks: []
        },
        {
            id: 'task-2-2',
            title: 'Chapter 2: Design Layout',
            instructions: 'Sketch the garden layout, considering sunlight and plant spacing.',
            completed: false,
            subTasks: []
        }
    ]
  }
];
