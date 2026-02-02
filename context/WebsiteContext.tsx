import React, { createContext, useContext, useState, useEffect } from 'react';
import { Website } from '../types';
import { MockService } from '../services/mockService';
import { useAuth } from './AuthContext';

interface WebsiteContextType {
  websites: Website[];
  selectedWebsite: Website | null;
  setSelectedWebsite: (website: Website | null) => void;
  isLoading: boolean;
  refreshWebsites: () => Promise<void>;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export const WebsiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const refreshWebsites = async () => {
    const data = await MockService.getWebsites(user?.id, user?.role);
    setWebsites(data);

    // If we have data but no selection (or selection is invalid), select the first one
    if (data.length > 0) {
      if (!selectedWebsite || !data.find(w => w.id === selectedWebsite.id)) {
        setSelectedWebsite(data[0]);
      } else {
        // Update the selected website object with fresh data
        const freshSelected = data.find(w => w.id === selectedWebsite.id);
        if (freshSelected) setSelectedWebsite(freshSelected);
      }
    } else {
      setSelectedWebsite(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshWebsites();
  }, [user?.id]);

  return (
    <WebsiteContext.Provider value={{ websites, selectedWebsite, setSelectedWebsite, isLoading, refreshWebsites }}>
      {children}
    </WebsiteContext.Provider>
  );
};

export const useWebsite = () => {
  const context = useContext(WebsiteContext);
  if (context === undefined) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
};
