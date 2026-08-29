import type { DevicePlatform } from '../../api/notification-device-service';
export const platformFor=(value:string):DevicePlatform=>value==='ios'?'ios':value==='android'?'android':'web';
