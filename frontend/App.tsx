import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { MemoPrint } from './components/MemoPrint';
import { MemoSheets } from './components/MemoSheets';
import { SalesTab } from './components/SalesTab';
import { LatestMemos } from './components/LatestMemos';
import { SettingsModal } from './components/SettingsModal';
import { Toaster } from '@/components/ui/toaster';

type Tab = 'memo-print' | 'memo-sheets' | 'sales';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('memo-print');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header onSettingsClick={() => setShowSettings(true)} />
        
        <main className="container mx-auto px-2 py-2 space-y-4">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="border border-border rounded-lg p-3">
            {activeTab === 'memo-print' && <MemoPrint />}
            {activeTab === 'memo-sheets' && <MemoSheets />}
            {activeTab === 'sales' && <SalesTab />}
          </div>
          
          {activeTab === 'memo-print' && <LatestMemos />}
        </main>

        <SettingsModal 
          open={showSettings} 
          onOpenChange={setShowSettings} 
        />
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
