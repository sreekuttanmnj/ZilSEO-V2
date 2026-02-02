import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ModuleKey, Permission, User } from '../types';
import { MockService } from '../services/mockService';
import { Shield, Save, User as UserIcon, Server, Globe, CheckCircle, Trash2 } from 'lucide-react';

export default function Admin() {
  const { checkPermission, user: currentUser, updateCurrentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'user' as 'admin' | 'user', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        name: selectedUser.name,
        email: selectedUser.email,
        password: selectedUser.password || ''
      });
      // Merge user permissions with all available modules to ensure new features are editable
      const allModules = Object.values(ModuleKey);
      const mergedPermissions = allModules.map(moduleKey => {
        const existing = selectedUser.permissions.find(p => p.module === moduleKey);
        // If permission exists for this module, use it. Otherwise default to all false.
        return existing
          ? { ...existing }
          : { module: moduleKey, canView: false, canEdit: false, canDelete: false };
      });
      setPermissions(mergedPermissions);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    const data = await MockService.getUsers();
    setUsers(data);
    if (!selectedUser && data.length > 0) setSelectedUser(data[0]);
  };

  const handleToggle = (module: ModuleKey, field: keyof Permission) => {
    setPermissions(prev => prev.map(p => {
      if (p.module === module) {
        return { ...p, [field]: !p[field as any] };
      }
      return p;
    }));
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const updated = await MockService.updateUser(selectedUser.id, {
        ...editForm,
        permissions
      });
      if (updated) {
        await loadUsers();
        setSelectedUser(updated);

        // If the user we just updated is the current logged in user, refresh AuthContext
        if (updated.id === currentUser?.id) {
          updateCurrentUser(updated);
        }

        alert('User updated successfully');
      }
    } catch (error) {
      alert('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (selectedUser.id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedUser.name}?`)) {
      await MockService.deleteUser(selectedUser.id);
      setSelectedUser(null);
      await loadUsers();
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newUser = await MockService.addUser(newUserForm.name, newUserForm.email, newUserForm.role, newUserForm.password);
      await loadUsers();
      setSelectedUser(newUser);
      setIsAddModalOpen(false);
      setNewUserForm({ name: '', email: '', role: 'user', password: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentUser?.role !== 'admin' || !checkPermission(ModuleKey.ADMIN, 'view')) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <Shield size={64} className="text-red-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">Only administrators can access the user management and system control section.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Shield className="text-purple-600" /> Admin Access Control
      </h1>



      <div className="flex flex-col lg:flex-row gap-8">
        {/* Users List */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Users</h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-medium transition"
            >
              + Add User
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {users.map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-4 cursor-pointer transition flex items-center gap-3 ${selectedUser?.id === u.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                {u.role === 'admin' && <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Admin</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Editor */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedUser ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                      <input
                        className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                      <input
                        className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                      <input
                        type="password"
                        className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                        value={editForm.password}
                        onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={handleDeleteUser}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete User"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={saveUserChanges}
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50"
                  >
                    <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Module</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">View</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Edit</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {permissions.map(perm => {
                      const label = perm.module.replace('_', ' ').toUpperCase();

                      return (
                        <tr key={perm.module} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{label}</td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canView}
                              onChange={() => handleToggle(perm.module, 'canView')}
                              className="w-5 h-5 text-accent rounded focus:ring-accent border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canEdit}
                              onChange={() => handleToggle(perm.module, 'canEdit')}
                              className="w-5 h-5 text-accent rounded focus:ring-accent border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canDelete}
                              onChange={() => handleToggle(perm.module, 'canDelete')}
                              className="w-5 h-5 text-accent rounded focus:ring-accent border-gray-300"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">Select a user to edit permissions</div>
          )}
        </div>
      </div>
      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                  placeholder="Enter user's name"
                  value={newUserForm.name}
                  onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                  placeholder="user@example.com"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Password</label>
                <input
                  type="password"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  value={newUserForm.password}
                  onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                  value={newUserForm.role}
                  onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as 'admin' | 'user' })}
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {newUserForm.role === 'admin'
                    ? 'Admins have full access to all system features.'
                    : 'Standard users have limited permissions by default.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}