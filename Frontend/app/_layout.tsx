import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/auth/auth-store';
import { useSyncConnectivity } from '../src/sync/sync-connectivity';
import { useCategoryCache } from '../src/sync/category-cache';
import { useBudgetCache } from '../src/sync/budget-cache';
import { usePreferencesStore } from '../src/preferences/preferences-store';
import { BiometricGate } from '../src/features/biometrics/biometric-gate';
import { usePushStore } from '../src/features/push/push-store';

export default function RootLayout(): React.ReactElement {
  const restore = useAuthStore((state) => state.restore);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  const loadPreferences = usePreferencesStore((state) => state.load);
  const syncPush = usePushStore((state) => state.sync);
  const clearPush = usePushStore((state) => state.clear);
  useEffect(() => { void restore(); }, [restore]);
  useSyncConnectivity(isLoading, isAuthenticated);
  useCategoryCache(isLoading, isAuthenticated, userId);
  useBudgetCache(isLoading, isAuthenticated, userId);
  useEffect(() => { void loadPreferences(isAuthenticated ? userId : undefined); }, [isAuthenticated, userId, loadPreferences]);
  useEffect(() => { if (!isLoading) void syncPush(isAuthenticated); }, [isLoading, isAuthenticated, syncPush]);
  useEffect(() => { if (!isLoading && !isAuthenticated) void clearPush(); }, [isLoading, isAuthenticated, clearPush]);
  return <BiometricGate><Stack screenOptions={{ headerShown: false }} /></BiometricGate>;
}
