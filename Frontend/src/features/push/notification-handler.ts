import { createNotificationResponseListener,type NotificationResponse,type NotificationSubscription } from './notification-listener';
import type { NotificationTarget } from './notification-routing';

type NotificationsModule=typeof import('expo-notifications');
type NotificationApi={setNotificationHandler(handler:{handleNotification:()=>Promise<{shouldShowBanner:boolean;shouldShowList:boolean;shouldPlaySound:boolean;shouldSetBadge:boolean}>}):void;addNotificationResponseReceivedListener(listener:(response:NotificationResponse)=>void):NotificationSubscription;};
const loadNotifications=():Promise<NotificationsModule>=>import('expo-notifications');
const foregroundBehavior={shouldShowBanner:true,shouldShowList:true,shouldPlaySound:false,shouldSetBadge:false};

export function createNotificationHandler(dependencies:{load:()=>Promise<NotificationApi>;remotePushUnavailable:()=>boolean}={load:loadNotifications,remotePushUnavailable:()=>false}){let initialized:Promise<boolean>|undefined;let listener:ReturnType<typeof createNotificationResponseListener>|undefined;let starting:Promise<(()=>void)>|undefined;const initialize=()=>{if(initialized)return initialized;initialized=(async()=>{try{const notifications=await dependencies.load();notifications.setNotificationHandler({handleNotification:async()=>foregroundBehavior});return true;}catch{initialized=undefined;return false;}})();return initialized;};return {initialize,async start(onTarget:(target:NotificationTarget)=>void):Promise<()=>void>{if(starting)return starting;starting=(async()=>{if(!await initialize()){starting=undefined;return ()=>{};}const notifications=await dependencies.load();listener??=createNotificationResponseListener(callback=>notifications.addNotificationResponseReceivedListener(callback),onTarget);listener.start();return ()=>{listener?.stop();listener=undefined;starting=undefined;};})();return starting;},status(){return {initialized:initialized!==undefined,listenerActive:listener?.isActive()??false,remotePushUnavailable:dependencies.remotePushUnavailable()};}};}
const productionHandler=createNotificationHandler();
export const initializeNotificationHandling=()=>productionHandler.initialize();
export const startNotificationResponseListener=(onTarget:(target:NotificationTarget)=>void)=>productionHandler.start(onTarget);
export const notificationHandlingStatus=()=>productionHandler.status();
