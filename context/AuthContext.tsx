import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ModuleKey } from '../types';
import { MockService } from '../services/mockService';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  checkPermission: (module: ModuleKey, action: 'view' | 'edit' | 'delete') => boolean;
  isLoading: boolean;
  updateCurrentUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      const storedUser = localStorage.getItem('seo_nexus_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Refresh from "server" (mock storage) to get latest permissions
        const users = await MockService.getUsers();
        const fresh = users.find(u => u.id === parsed.id);
        if (fresh) {
          setUser(fresh);
          localStorage.setItem('seo_nexus_user', JSON.stringify(fresh));
        } else {
          setUser(parsed);
        }
      }
      setIsLoading(false);
    };
    syncUser();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    const users = await MockService.getUsers();
    const foundUser = users.find(u => u.email === email);

    // If user has a password set, require it to match. 
    // Otherwise allow login (for initial seeded users without passwords)
    if (foundUser && (!foundUser.password || foundUser.password === password)) {
      setUser(foundUser);
      localStorage.setItem('seo_nexus_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('seo_nexus_user');
  };

  const updateCurrentUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('seo_nexus_user', JSON.stringify(updatedUser));
  };

  const checkPermission = (module: ModuleKey, action: 'view' | 'edit' | 'delete'): boolean => {
    if (!user) return false;

    // Admins are superusers and have full access to everything
    if (user.role === 'admin') return true;

    const perm = user.permissions.find(p => p.module === module);

    // If permission record is missing for a standard user, deny access (safer default)
    if (!perm) return false;

    if (action === 'view') return perm.canView;
    if (action === 'edit') return perm.canEdit;
    if (action === 'delete') return perm.canDelete;
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkPermission, isLoading, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
