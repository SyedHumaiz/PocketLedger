import { Stack,useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/auth/auth-store';
import { useSyncConnectivity } from '../src/sync/sync-connectivity';
import { useCategoryCache } from '../src/sync/category-cache';
import { useBudgetCache } from '../src/sync/budget-cache';
import { useGroupCache } from '../src/sync/group-cache';
import { usePreferencesStore } from '../src/preferences/preferences-store';
import { BiometricGate } from '../src/features/biometrics/biometric-gate';
import { initializeNotificationHandling,startNotificationResponseListener } from '../src/features/push/notification-handler';
import { usePushStore } from '../src/features/push/push-store';

export default function RootLayout(): React.ReactElement {
  const router=useRouter();
  const restore = useAuthStore((state) => state.restore);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);
  const loadPreferences = usePreferencesStore((state) => state.load);
  const syncPush = usePushStore((state) => state.sync);
  const clearPush = usePushStore((state) => state.clear);
  const setListenerActive=usePushStore((state)=>state.setListenerActive);
  useEffect(() => { void restore(); }, [restore]);
  useSyncConnectivity(isLoading, isAuthenticated);
  useCategoryCache(isLoading, isAuthenticated, userId);
  useBudgetCache(isLoading, isAuthenticated, userId);
  useGroupCache(isLoading,isAuthenticated,userId);
  useEffect(() => { void loadPreferences(isAuthenticated ? userId : undefined); }, [isAuthenticated, userId, loadPreferences]);
  useEffect(() => { if (!isLoading) void syncPush(isAuthenticated); }, [isLoading, isAuthenticated, syncPush]);
  useEffect(() => { if (!isLoading && !isAuthenticated) void clearPush(); }, [isLoading, isAuthenticated, clearPush]);
  useEffect(()=>{if(isLoading||!isAuthenticated){setListenerActive(false);return;}let cancelled=false,stop:()=>void=()=>{};void initializeNotificationHandling();void startNotificationResponseListener(target=>{if(target.kind==='group')router.push({pathname:'/groups/[id]',params:{id:target.groupId}});else if(target.kind==='recurring')router.push('/recurring');else router.replace('/home');}).then(remove=>{if(cancelled)remove();else{stop=remove;setListenerActive(true);}}).catch(()=>setListenerActive(false));return ()=>{cancelled=true;stop();setListenerActive(false);};},[isLoading,isAuthenticated,router,setListenerActive]);
  return <BiometricGate><Stack screenOptions={{ headerShown: false }} /></BiometricGate>;
}
