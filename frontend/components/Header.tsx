import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [siteIcon, setSiteIcon] = useState<string>('');
  const [headerTitle, setHeaderTitle] = useState('SHJ DATABASE');

  useEffect(() => {
    const savedIcon = localStorage.getItem('siteIcon');
    const savedTitle = localStorage.getItem('headerTitle');
    if (savedIcon) setSiteIcon(savedIcon);
    if (savedTitle) setHeaderTitle(savedTitle);
  }, []);

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-2 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {siteIcon && (
              <img 
                src={siteIcon} 
                alt="Site Icon" 
                className="w-6 h-6 object-contain"
              />
            )}
            <h1 className="text-xl font-bold text-primary font-['Arial','Roboto',sans-serif]">
              {headerTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-1"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="p-1"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
