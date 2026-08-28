import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/auth/auth-store';
import { useSyncConnectivity } from '../src/sync/sync-connectivity';
import { useCategoryCache } from '../src/sync/category-cache';

export default function RootLayout(): React.ReactElement {
  const restore = useAuthStore((state) => state.restore);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  useEffect(() => { void restore(); }, [restore]);
  useSyncConnectivity(isLoading, isAuthenticated);
  useCategoryCache(isLoading, isAuthenticated, userId);
  return <Stack screenOptions={{ headerShown: false }} />;
}
