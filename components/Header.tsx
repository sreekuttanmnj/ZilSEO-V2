import React from 'react';
import { Menu, ChevronDown, Globe } from 'lucide-react';
import { useWebsite } from '../context/WebsiteContext';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { websites, selectedWebsite, setSelectedWebsite } = useWebsite();

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const site = websites.find(w => w.id === e.target.value);
    setSelectedWebsite(site || null);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 z-10">
      {/* Left: Mobile Menu & Brand */}
      <div className="flex items-center">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold text-lg text-gray-800 lg:hidden">ZilSEO</span>
        
        {/* Desktop Title */}
        <h2 className="hidden lg:block text-xl font-semibold text-gray-800">Dashboard</h2>
      </div>

      {/* Right: Global Website Selector */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 min-w-[200px] hover:border-accent transition-colors">
            <Globe size={18} className="text-gray-500" />
            <select
              value={selectedWebsite?.id || ''}
              onChange={handleWebsiteChange}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-full appearance-none cursor-pointer"
              disabled={websites.length === 0}
            >
              {websites.length === 0 ? (
                <option>No Websites Found</option>
              ) : (
                websites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown size={16} className="text-gray-400 pointer-events-none absolute right-3" />
          </div>
        </div>
      </div>
    </header>
  );
}