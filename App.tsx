import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { WebsiteProvider } from './context/WebsiteContext';
import { ModuleKey } from './types';

// Pages
import Login from './pages/Login';
import Websites from './pages/Websites';
import Tracking from './pages/Tracking';
import PagesManager from './pages/PagesManager';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Work from './pages/Work';
import Admin from './pages/Admin';
import GscCallback from './pages/GscCallback';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const ProtectedRoute = ({ children, module }: React.PropsWithChildren<{ module?: ModuleKey }>) => {
  const { user, isLoading, checkPermission } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (module && !checkPermission(module, 'view')) {
    return (
      <div className="h-screen flex items-center justify-center flex-col text-center p-4">
        <h1 className="text-4xl font-bold text-gray-300 mb-4">403</h1>
        <p className="text-xl text-gray-600">You do not have permission to view this module.</p>
      </div>
    );
  }

  return <>{children}</>;
};

const Layout = ({ children }: React.PropsWithChildren<{}>) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WebsiteProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />

                <Route path="/websites" element={
                  <ProtectedRoute module={ModuleKey.WEBSITES}>
                    <Websites />
                  </ProtectedRoute>
                } />

                <Route path="/tracking" element={
                  <ProtectedRoute module={ModuleKey.SEO_TRACKING}>
                    <Tracking />
                  </ProtectedRoute>
                } />

                <Route path="/pages" element={
                  <ProtectedRoute module={ModuleKey.PAGES}>
                    <PagesManager />
                  </ProtectedRoute>
                } />

                <Route path="/campaigns" element={
                  <ProtectedRoute module={ModuleKey.CAMPAIGNS}>
                    <Campaigns />
                  </ProtectedRoute>
                } />

                <Route path="/work" element={
                  <ProtectedRoute module={ModuleKey.WORK}>
                    <Work />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute module={ModuleKey.ADMIN}>
                    <Admin />
                  </ProtectedRoute>
                } />

                <Route path="/oauth2callback" element={<GscCallback />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </WebsiteProvider>
  );
}