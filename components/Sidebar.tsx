import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ModuleKey } from '../types';
import {
  LayoutDashboard,
  Globe,
  LineChart,
  FileText,
  Briefcase,
  Shield,
  LogOut,
  Megaphone,
  Menu
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const { checkPermission, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-primary text-white transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col h-full`}>

        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl">Z</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ZilSEO</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/" className={navItemClass}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>

          {checkPermission(ModuleKey.WEBSITES, 'view') && (
            <NavLink to="/websites" className={navItemClass}>
              <Globe size={20} />
              <span>Websites</span>
            </NavLink>
          )}

          {checkPermission(ModuleKey.SEO_TRACKING, 'view') && (
            <NavLink to="/tracking" className={navItemClass}>
              <LineChart size={20} />
              <span>SEO Tracking</span>
            </NavLink>
          )}

          {checkPermission(ModuleKey.PAGES, 'view') && (
            <NavLink to="/pages" className={navItemClass}>
              <FileText size={20} />
              <span>Mw</span>
            </NavLink>
          )}

          {checkPermission(ModuleKey.CAMPAIGNS, 'view') && (
            <NavLink to="/campaigns" className={navItemClass}>
              <Megaphone size={20} />
              <span>Campaigns</span>
            </NavLink>
          )}

          {checkPermission(ModuleKey.WORK, 'view') && (
            <NavLink to="/work" className={navItemClass}>
              <Briefcase size={20} />
              <span>Work</span>
            </NavLink>
          )}

          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-gray-700">
              <NavLink to="/admin" className={navItemClass}>
                <Shield size={20} />
                <span>Admin</span>
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}