import React from 'react';
import { Button } from '@/components/ui/button';

type Tab = 'memo-print' | 'memo-sheets' | 'sales' | 'this-week';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'memo-print' as Tab, label: 'Memo Print' },
    { id: 'memo-sheets' as Tab, label: 'Memo Sheets' },
    { id: 'sales' as Tab, label: 'Sales' },
    { id: 'this-week' as Tab, label: 'This Week Entry' },
  ];

  return (
    <div className="flex gap-1 border border-border rounded-lg p-1">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className="flex-1 text-sm font-['Arial','Roboto',sans-serif]"
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
