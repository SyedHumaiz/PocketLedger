import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/auth/auth-store';
import { useSyncConnectivity } from '../src/sync/sync-connectivity';

export default function RootLayout(): React.ReactElement {
  const restore = useAuthStore((state) => state.restore);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useEffect(() => { void restore(); }, [restore]);
  useSyncConnectivity(isLoading, isAuthenticated);
  return <Stack screenOptions={{ headerShown: false }} />;
}
