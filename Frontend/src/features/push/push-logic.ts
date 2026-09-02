import type { DevicePlatform } from '../../api/notification-device-service';
export const platformFor=(value:string):DevicePlatform=>value==='ios'?'ios':value==='android'?'android':'web';
export const isExpoGoAndroid=(platform:string,environment:string|undefined):boolean=>platform==='android'&&environment==='storeClient';
export const remotePushUnavailable=(platform:string,environment:string|undefined):boolean=>platform==='web'||isExpoGoAndroid(platform,environment);
