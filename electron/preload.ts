
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  generateTasks: (data: any) => ipcRenderer.invoke('generate-tasks', data),
  chatWithGoal: (data: any) => ipcRenderer.invoke('chat-with-goal', data),
  generateNudge: (data: any) => ipcRenderer.invoke('generate-nudge', data),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
});
