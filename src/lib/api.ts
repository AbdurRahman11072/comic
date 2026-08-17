import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // send cookies for better-auth sessions
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('/api/') && !config.url.startsWith('http')) {
    config.url = `/api/v1${config.url.startsWith('/') ? config.url : `/${config.url}`}`;
  }
  return config;
});

export const uploadImage = async (file: File): Promise<{ data: { url: string } }> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/api/v1/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export default api;
