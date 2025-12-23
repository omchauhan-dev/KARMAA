
'use client';

import React, { useMemo, useCallback } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Position, Handle, NodeProps, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';

// Custom Node Component
const TaskNode = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-card border-2 border-border min-w-[150px] text-center">
      <Handle type="target" position={Position.Top} className="w-16 !bg-muted-foreground" />
      <div className="font-bold text-sm">{data.label}</div>
      {data.completed && <div className="text-xs text-green-500 mt-1">Completed</div>}
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-muted-foreground" />
    </div>
  );
};

const nodeTypes = {
  taskNode: TaskNode,
};

type MindMapViewProps = {
  tasks: Task[];
  goalTitle: string;
};

export function MindMapView({ tasks, goalTitle }: MindMapViewProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: any[] = [];
    const edges: Edge[] = [];
    
    // Root Node (Goal)
    nodes.push({
      id: 'root',
      type: 'taskNode',
      data: { label: goalTitle, completed: false },
      position: { x: 0, y: 0 },
    });

    let yOffset = 150;
    
    // Recursive function to build the tree
    const buildTree = (taskList: Task[], parentId: string, level: number, xStart: number, width: number) => {
      const count = taskList.length;
      if (count === 0) return;

      const spacingX = 250;
      const totalWidth = (count - 1) * spacingX;
      let currentX = xStart - totalWidth / 2;

      taskList.forEach((task, index) => {
        const nodeId = task.id;
        nodes.push({
          id: nodeId,
          type: 'taskNode',
          data: { label: task.title, completed: task.completed },
          position: { x: currentX, y: yOffset * level },
        });

        edges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'smoothstep',
          animated: true,
        });

        if (task.subTasks && task.subTasks.length > 0) {
            // Recurse
             buildTree(task.subTasks, nodeId, level + 1, currentX, spacingX);
        }
        
        currentX += spacingX;
      });
    };

    buildTree(tasks, 'root', 1, 0, 1000);

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks, goalTitle]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when tasks change (simple re-initialization for now)
  React.useEffect(() => {
     setNodes(initialNodes);
     setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="h-[600px] w-full border rounded-lg bg-background/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
