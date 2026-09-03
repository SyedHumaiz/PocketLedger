import type { LocalRecurringExpenseRecord } from '../../db/types';
import { formatMinor } from '../currency/amount';

type NotificationsModule = typeof import('expo-notifications');

// Expo Router imports route modules eagerly, so only load this native module for an action.
const loadNotifications = (): Promise<NotificationsModule> => import('expo-notifications');

export async function notificationPermission(): Promise<boolean> {
  try { return (await (await loadNotifications()).getPermissionsAsync()).granted; } catch { return false; }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const notifications = await loadNotifications();
    const current = await notifications.getPermissionsAsync();
    return current.granted || (await notifications.requestPermissionsAsync()).granted;
  } catch { return false; }
}

export async function scheduleRecurringReminder(item: LocalRecurringExpenseRecord): Promise<string | null> {
  if (!item.enabled || item.notificationId || !await requestNotificationPermission()) return item.notificationId;
  try {
    const notifications = await loadNotifications(), due = new Date(item.nextDueAt);
    const trigger = item.frequency === 'DAILY'
      ? { type: notifications.SchedulableTriggerInputTypes.DAILY, hour: due.getHours(), minute: due.getMinutes() }
      : item.frequency === 'WEEKLY'
        ? { type: notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: due.getDay() + 1, hour: due.getHours(), minute: due.getMinutes() }
        : { type: notifications.SchedulableTriggerInputTypes.MONTHLY, day: due.getDate(), hour: due.getHours(), minute: due.getMinutes() };
    return await notifications.scheduleNotificationAsync({ content: { title: 'Recurring expense reminder', body: `${item.title} · ${formatMinor(item.amountMinor, item.currency)}`, data:{type:'recurring-reminder'} }, trigger: trigger as never });
  } catch { return null; }
}

export async function cancelRecurringReminder(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try { await (await loadNotifications()).cancelScheduledNotificationAsync(notificationId); } catch { /* non-blocking */ }
}
