import axios from 'axios';

import { API } from '@/utils/config';

export const api = axios.create({
  baseURL: API.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('@LearningLab:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
