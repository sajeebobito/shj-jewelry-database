import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    headerTitle: 'SHJ DATABASE',
    siteIcon: '',
    logoUrl: '',
  });

  useEffect(() => {
    const savedTitle = localStorage.getItem('headerTitle');
    const savedIcon = localStorage.getItem('siteIcon');
    const savedLogo = localStorage.getItem('logoUrl');
    
    setSettings({
      headerTitle: savedTitle || 'SHJ DATABASE',
      siteIcon: savedIcon || '',
      logoUrl: savedLogo || '',
    });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: string, file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({
          ...prev,
          [field]: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('headerTitle', settings.headerTitle);
    localStorage.setItem('siteIcon', settings.siteIcon);
    localStorage.setItem('logoUrl', settings.logoUrl);
    
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
    
    // Trigger a page reload to update the header
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="headerTitle">Header Title</Label>
            <Input
              id="headerTitle"
              value={settings.headerTitle}
              onChange={(e) => handleInputChange('headerTitle', e.target.value)}
              placeholder="SHJ DATABASE"
            />
          </div>

          <div>
            <Label htmlFor="siteIcon">Site Icon Upload</Label>
            <Input
              id="siteIcon"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('siteIcon', file);
              }}
            />
            {settings.siteIcon && (
              <div className="mt-2">
                <img 
                  src={settings.siteIcon} 
                  alt="Site Icon Preview" 
                  className="w-8 h-8 object-contain border rounded"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="logoUpload">Main Page Logo Upload</Label>
            <Input
              id="logoUpload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('logoUrl', file);
              }}
            />
            {settings.logoUrl && (
              <div className="mt-2">
                <img 
                  src={settings.logoUrl} 
                  alt="Logo Preview" 
                  className="w-20 h-20 object-contain border rounded"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
