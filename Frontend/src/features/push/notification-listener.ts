import { notificationTarget,type NotificationTarget } from './notification-routing';
export interface NotificationResponse { notification:{request:{content:{data:unknown}}}; }
export interface NotificationSubscription { remove():void; }
export function createNotificationResponseListener(subscribe:(listener:(response:NotificationResponse)=>void)=>NotificationSubscription,onTarget:(target:NotificationTarget)=>void){let subscription:NotificationSubscription|undefined,active=false;return {start(){if(active)return false;active=true;subscription=subscribe(response=>{if(active)onTarget(notificationTarget(response?.notification?.request?.content?.data));});return true;},stop(){active=false;subscription?.remove();subscription=undefined;},isActive:()=>active};}
