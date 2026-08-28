import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { syncPendingOperations } from './sync-worker';
import { createSyncConnectivity } from './sync-connectivity-core';

export function useSyncConnectivity(isLoading:boolean,isAuthenticated:boolean):void{const controller=useRef(createSyncConnectivity({addEventListener:listener=>NetInfo.addEventListener(listener),fetch:()=>NetInfo.fetch(),sync:syncPendingOperations}));useEffect(()=>()=>controller.current.dispose(),[]);useEffect(()=>{controller.current.updateAuth({isLoading,isAuthenticated});},[isLoading,isAuthenticated]);}
