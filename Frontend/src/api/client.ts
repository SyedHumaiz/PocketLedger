import axios, { AxiosError } from 'axios';

import { toApiError } from './api-error';
export { toApiError } from './api-error';
import { getApiBaseUrl } from './config';
import { tokenStorage } from '../auth/token-storage';
export const api=axios.create({baseURL:getApiBaseUrl(),timeout:15000});
api.interceptors.request.use(async config=>{const token=await tokenStorage.get();if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(r=>r,async error=>{if((error as AxiosError).response?.status===401)await tokenStorage.remove();return Promise.reject(toApiError(error));});
