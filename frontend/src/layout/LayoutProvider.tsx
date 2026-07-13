import { useState, useEffect, type ReactNode } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

interface LayoutProviderProps {
  role: string;
  navigation: any[];
  children: ReactNode;
  headerOptions?: {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
  };
}

export const LayoutProvider = ({ role, navigation, children, headerOptions }: LayoutProviderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        navigation={navigation} 
      />
      
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'xl:ml-[240px]' : 'xl:ml-[64px]'}`}>
        <Header 
          role={role} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen}
          {...headerOptions}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-[1400px] mx-auto space-y-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
