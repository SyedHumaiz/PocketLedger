import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { getBudgets } from '../api/budget-service';
import { mapBudgetResponse } from '../api/budget-mapping';
import { getDatabase } from '../db/database';
import { upsertLocalBudgets } from '../db/budget-repository';
export async function refreshBudgetCache(userId:string):Promise<void>{const budgets=await getBudgets();await upsertLocalBudgets(await getDatabase(),userId,budgets.map(item=>mapBudgetResponse(item,userId)));}
export function useBudgetCache(isLoading:boolean,isAuthenticated:boolean,userId:string|undefined):void{const active=useRef(false);useEffect(()=>{if(isLoading||!isAuthenticated||!userId||active.current)return;active.current=true;const unsubscribe=NetInfo.addEventListener(state=>{if(state.isConnected!==false&&state.isInternetReachable!==false)void refreshBudgetCache(userId).catch(()=>undefined);});void NetInfo.fetch().then(state=>{if(state.isConnected!==false&&state.isInternetReachable!==false)return refreshBudgetCache(userId);}).catch(()=>undefined);return ()=>{active.current=false;unsubscribe();};},[isLoading,isAuthenticated,userId]);}
