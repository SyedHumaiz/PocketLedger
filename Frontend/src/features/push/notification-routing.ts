export type NotificationTarget={kind:'group';groupId:string}|{kind:'recurring'}|{kind:'home'};
const groupEvents=new Set(['group','group-expense','group-member','settlement','group-settlement']);
const recurringEvents=new Set(['recurring','recurring-reminder']);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function notificationTarget(data:unknown):NotificationTarget{if(!data||typeof data!=='object'||Array.isArray(data))return {kind:'home'};const value=data as Record<string,unknown>,type=typeof value.type==='string'?value.type:'';if(recurringEvents.has(type))return {kind:'recurring'};const groupId=typeof value.groupId==='string'?value.groupId:'';return groupEvents.has(type)&&uuid.test(groupId)?{kind:'group',groupId}:{kind:'home'};}
