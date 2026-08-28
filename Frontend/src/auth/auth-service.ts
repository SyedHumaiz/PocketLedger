import { api } from '../api/client'; import { tokenStorage } from './token-storage';
export interface AuthUser { id:string; email:string; name:string; createdAt:string; updatedAt:string; }
export interface AuthResponse { accessToken:string; user:AuthUser; }
export interface RegisterInput { name:string; email:string; password:string; } export interface LoginInput { email:string; password:string; }
export async function register(input:RegisterInput){const {data}=await api.post<AuthResponse>('/auth/register',input);await tokenStorage.save(data.accessToken);return data;}
export async function login(input:LoginInput){const {data}=await api.post<AuthResponse>('/auth/login',input);await tokenStorage.save(data.accessToken);return data;}
export async function getCurrentUser(){return (await api.get<AuthUser>('/auth/me')).data;}
export const logout=()=>tokenStorage.remove();
