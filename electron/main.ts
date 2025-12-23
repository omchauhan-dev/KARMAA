
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { generateTasksForGoal } from '../src/ai/flows/generate-tasks-flow';
import { chatWithGoal } from '../src/ai/flows/chat-flow';
import { generateNudge } from '../src/ai/flows/nudge-flow';

// Disable Genkit telemetry/server features that might conflict or error in Electron if possible
process.env.GENKIT_ENV = 'dev'; 

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:9002');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('generate-tasks', async (_event, data) => {
  try {
    console.log('Generating tasks for:', data.title);
    return await generateTasksForGoal(data);
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw error;
  }
});

ipcMain.handle('chat-with-goal', async (_event, data) => {
  try {
    return await chatWithGoal(data);
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
});

ipcMain.handle('generate-nudge', async (_event, data) => {
  try {
    return await generateNudge(data);
  } catch (error) {
    console.error('Error in nudge:', error);
    throw error;
  }
});

ipcMain.handle('open-external', async (_event, url) => {
  await shell.openExternal(url);
});
