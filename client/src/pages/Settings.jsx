import { useState, useEffect } from 'react';
import {
  User, Lock, Palette, Bell, Trash2, Camera,
  Save, AlertTriangle, X, Check, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function DeleteAccountModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative card max-w-sm w-full p-6 animate-scale-in">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Account</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          This will permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentRole: user?.currentRole || '',
    avatar: user?.avatar || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    analysisComplete: user?.settings?.notifications?.analysisComplete ?? true,
    weeklyReports: user?.settings?.notifications?.weeklyReports ?? false,
    resumeTips: user?.settings?.notifications?.resumeTips ?? true,
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { user: updated } = await userService.updateProfile(profile);
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await userService.changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    try {
      const { user: updated } = await userService.updateSettings({ notifications });
      updateUser(updated);
      toast.success('Notification preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      toast.success('Account deleted');
      logout();
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`settings-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-1 justify-center ${
              activeTab === id
                ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6 animate-fade-in">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                <Camera size={14} className="text-gray-500" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  id="settings-name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <input
                  id="settings-email"
                  type="email"
                  value={profile.email}
                  className="input-field opacity-60 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  id="settings-phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="input-field"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Role</label>
                <input
                  id="settings-role"
                  type="text"
                  value={profile.currentRole}
                  onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Software Engineer"
                />
              </div>
            </div>
            <button id="save-profile-btn" type="submit" disabled={profileLoading} className="btn-primary">
              {profileLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-5">
            {[
              { id: 'currentPassword', label: 'Current Password', key: 'current' },
              { id: 'newPassword', label: 'New Password', key: 'new' },
              { id: 'confirmPassword', label: 'Confirm New Password', key: 'confirm' },
            ].map(({ id, label, key }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                <div className="relative">
                  <input
                    id={`settings-${id}`}
                    type={showPwd[key] ? 'text' : 'password'}
                    value={passwords[id]}
                    onChange={(e) => setPasswords({ ...passwords, [id]: e.target.value })}
                    className="input-field pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd({ ...showPwd, [key]: !showPwd[key] })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}
            <button id="save-password-btn" type="submit" disabled={passwordLoading} className="btn-primary">
              {passwordLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lock size={16} /> Update Password</>}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="mt-10 pt-8 border-t border-red-100 dark:border-red-900/30">
            <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Once you delete your account, all your data will be permanently removed.
            </p>
            <button
              id="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-semibold rounded-xl text-sm transition-colors"
            >
              <Trash2 size={16} />
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Theme Preference</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                id: 'theme-light', value: 'light', label: 'Light Mode',
                preview: 'bg-white border-2',
                innerBg: 'bg-gray-100',
                innerCard: 'bg-white border border-gray-200',
              },
              {
                id: 'theme-dark', value: 'dark', label: 'Dark Mode',
                preview: 'bg-gray-900 border-2',
                innerBg: 'bg-gray-800',
                innerCard: 'bg-gray-700 border border-gray-600',
              },
            ].map(({ id, value, label, preview, innerBg, innerCard }) => (
              <button
                key={value}
                id={id}
                onClick={() => theme !== value && toggleTheme()}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  theme === value
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Preview */}
                <div className={`${preview} ${theme === value ? 'border-indigo-300' : 'border-gray-200 dark:border-gray-600'} rounded-xl p-3 mb-3 aspect-video flex flex-col gap-2`}>
                  <div className={`${innerBg} rounded-md h-3 w-3/4`} />
                  <div className={`${innerCard} rounded-md h-8`} />
                  <div className={`${innerCard} rounded-md h-8`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{label}</span>
                  {theme === value && (
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h3>
          <div className="space-y-5">
            {[
              { key: 'analysisComplete', label: 'Analysis Complete', desc: 'Get notified when your resume analysis is ready' },
              { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive a weekly summary of your resume performance' },
              { key: 'resumeTips', label: 'Resume Tips', desc: 'Get personalized tips to improve your resume score' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                </div>
                <button
                  id={`notif-${key}`}
                  onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                    notifications[key] ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    notifications[key] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
          <button id="save-notifications-btn" onClick={handleNotificationsSave} className="btn-primary mt-6">
            <Save size={16} />
            Save Preferences
          </button>
        </div>
      )}

      {showDeleteModal && (
        <DeleteAccountModal onConfirm={handleDeleteAccount} onCancel={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}
