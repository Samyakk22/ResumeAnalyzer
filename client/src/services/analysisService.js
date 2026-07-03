import api from './api';

export const analysisService = {
  // Create new analysis (multipart form)
  create: async (file, jobDescription, jobTitle, requestId) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    if (jobTitle) formData.append('jobTitle', jobTitle);
    if (requestId) formData.append('requestId', requestId);

    const { data } = await api.post('/analyses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getAll: async () => {
    const { data } = await api.get('/analyses');
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/analyses/${id}`);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/analyses/${id}`);
    return data;
  },
};
