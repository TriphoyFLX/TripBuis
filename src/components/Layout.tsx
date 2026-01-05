// src/components/Layout/Layout.tsx
import React, { useState, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

// Создаем контекст для передачи состояния сворачивания
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={`${styles.sidebarContainer} ${sidebarOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
          <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
          <div className={styles.sidebarContent}>
            <Sidebar />
          </div>
        </aside>

        {/* Основной контент */}
        <main className={`${styles.mainContent} ${isCollapsed ? styles.mainCollapsed : ''}`}>
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </main>

        {/* Мобильный оверлей */}
        {sidebarOpen && (
          <div 
            className={styles.mobileOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;