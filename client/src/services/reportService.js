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
    const response = await api.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ResumeIQ-Report-${jobTitle || 'report'}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  delete: async (id) => {
    const { data } = await api.delete(`/reports/${id}`);
    return data;
  },
};
