import { API } from '@/utils/config';
import axios from 'axios';

export const api = axios.create({
  baseURL: API.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
