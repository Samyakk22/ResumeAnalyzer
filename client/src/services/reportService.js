import api from './api';

export const reportService = {
  getAll: async (search = '') => {
    const { data } = await api.get(`/reports${search ? `?search=${search}` : ''}`);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/reports/${id}`);
    return data;
  },

  download: async (id, jobTitle) => {
    // PDF downloads have been removed; surface an error for callers
    throw new Error('PDF download removed');
  },

  delete: async (id) => {
    const { data } = await api.delete(`/reports/${id}`);
    return data;
  },
};
