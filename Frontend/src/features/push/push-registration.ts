import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { DevicePlatform } from '../../api/notification-device-service';
import { isExpoGoAndroid as isExpoGoAndroidFor, remotePushUnavailable as remotePushUnavailableFor } from './push-logic';

type NotificationsModule = typeof import('expo-notifications');
type ExecutionEnvironment = 'bare' | 'standalone' | 'storeClient' | undefined;
const loadNotifications = (): Promise<NotificationsModule> => import('expo-notifications');

export type PermissionState = 'granted' | 'denied' | 'restricted' | 'undetermined';
export const platformFor = (value = Platform.OS): DevicePlatform => value === 'ios' ? 'ios' : value === 'android' ? 'android' : 'web';
export const isExpoGoAndroid = (platform = Platform.OS, environment = Constants.executionEnvironment as ExecutionEnvironment): boolean => isExpoGoAndroidFor(platform, environment);
export const remotePushUnavailable = (platform = Platform.OS, environment = Constants.executionEnvironment as ExecutionEnvironment): boolean => remotePushUnavailableFor(platform, environment);

export async function notificationPermissionState(): Promise<PermissionState> {
  try {
    const status = (await (await loadNotifications()).getPermissionsAsync()).status;
    return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : status === 'undetermined' ? 'undetermined' : 'restricted';
  } catch { return 'restricted'; }
}

export async function requestPushPermission(): Promise<PermissionState> {
  if (remotePushUnavailable()) return 'restricted';
  try {
    const current = await notificationPermissionState();
    if (current === 'granted' || current === 'restricted') return current;
    const status = (await (await loadNotifications()).requestPermissionsAsync()).status;
    return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'restricted';
  } catch { return 'restricted'; }
}

export async function expoPushToken(): Promise<string | null> {
  if (remotePushUnavailable()) return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return null;
  try { return (await (await loadNotifications()).getExpoPushTokenAsync({ projectId })).data || null; } catch { return null; }
}
