import { createContext } from 'react';

export interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isMobile: boolean;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);