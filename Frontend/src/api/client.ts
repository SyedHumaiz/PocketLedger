import axios, { AxiosError } from 'axios';
import { getApiBaseUrl } from './config'; import { tokenStorage } from '../auth/token-storage';
export interface ApiError { status:number|null; message:string; }
export function toApiError(error:unknown):ApiError { if(error&&typeof error==='object'&&'status' in error&&'message' in error){const known=error as ApiError;return {status:known.status,message:known.message};}const e=error as AxiosError<{message?:string}>; return {status:e.response?.status??null,message:e.response?.data?.message??e.message??'Network request failed.'}; }
export const api=axios.create({baseURL:getApiBaseUrl(),timeout:15000});
api.interceptors.request.use(async config=>{const token=await tokenStorage.get();if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(r=>r,async error=>{if((error as AxiosError).response?.status===401)await tokenStorage.remove();return Promise.reject(toApiError(error));});
