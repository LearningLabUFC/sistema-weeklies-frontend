import axios, { type AxiosRequestConfig } from 'axios';

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

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const isUnauthorized = error.response?.status === 401;
    const isRefreshRoute = originalRequest.url?.includes('/auth/refresh');
    const alreadyRetried = originalRequest._retry;

    if (!isUnauthorized || isRefreshRoute || alreadyRetried) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('@LearningLab:refreshToken');

      if (!refreshToken) {
        throw new Error('Refresh token não encontrado.');
      }

      const { data } = await api.post('/auth/refresh', {
        token_atualizacao: refreshToken,
      });

      const newAccessToken = data.token_acesso;
      const newRefreshToken = data.token_atualizacao;

      localStorage.setItem('@LearningLab:token', newAccessToken);
      localStorage.setItem('@LearningLab:refreshToken', newRefreshToken);

      processQueue(null, newAccessToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      localStorage.removeItem('@LearningLab:token');
      localStorage.removeItem('@LearningLab:refreshToken');
      localStorage.removeItem('@LearningLab:user');

      window.location.href = '/login';

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
