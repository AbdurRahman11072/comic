import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // send cookies for better-auth sessions
  headers: {
    'Content-Type': 'application/json',
  },
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
