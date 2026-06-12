import api from './api';

export const userService = {
  getStats: async () => {
    const { data } = await api.get('/users/stats');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.put('/users/password', { currentPassword, newPassword });
    return data;
  },

  updateSettings: async (settings) => {
    const { data } = await api.put('/users/settings', settings);
    return data;
  },

  deleteAccount: async () => {
    const { data } = await api.delete('/users/account');
    return data;
  },

  getVersions: async () => {
    const { data } = await api.get('/versions');
    return data;
  },
};
