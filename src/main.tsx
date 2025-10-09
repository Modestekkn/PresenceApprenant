import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { SidebarProvider } from './contexts/SidebarProvider.tsx';
import { ToastProvider } from './components/UI/Toast.tsx';
import AppInitializer from './components/AppInitializer.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <ToastProvider>
            <AppInitializer />
          </ToastProvider>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
