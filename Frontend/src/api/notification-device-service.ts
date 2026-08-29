import { api } from './client';
export type DevicePlatform='android'|'ios'|'web'; export interface NotificationDevice {id:string;platform:DevicePlatform;enabled:boolean;lastSeenAt:string;createdAt:string;updatedAt:string;}
export const registerNotificationDevice=async(pushToken:string,platform:DevicePlatform)=>(await api.post<NotificationDevice>('/notifications/devices',{pushToken,platform})).data;
export const listNotificationDevices=async()=>(await api.get<NotificationDevice[]>('/notifications/devices')).data;
export const removeNotificationDevice=async(id:string)=>(await api.delete<{removed:boolean}>(`/notifications/devices/${id}`)).data;
