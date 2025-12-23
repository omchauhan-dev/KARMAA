
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FocusModeProvider } from '@/components/app/focus-mode';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FocusModeProvider>
      <App />
      <Toaster />
    </FocusModeProvider>
  </React.StrictMode>,
);
