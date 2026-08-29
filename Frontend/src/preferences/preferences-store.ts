import { create } from 'zustand';
import { getDatabase } from '../db/database';
import type { SupportedCurrency, UserPreferences } from '../db/types';
import { loadPreferences, savePreferences } from './preferences-repository';
interface PreferencesState { preferences:UserPreferences|null; loading:boolean; load(userId:string|undefined):Promise<void>; update(change:Partial<Pick<UserPreferences,'defaultCurrency'|'showDecimalPlaces'|'biometricLockEnabled'>>):Promise<void>; clear():void; }
export const usePreferencesStore=create<PreferencesState>((set,get)=>({preferences:null,loading:false,async load(userId){if(!userId){set({preferences:null,loading:false});return;}set({loading:true});try{set({preferences:await loadPreferences(await getDatabase(),userId)});}finally{set({loading:false});}},async update(change){const current=get().preferences;if(!current)return;const next={...current,...change,updatedAt:new Date().toISOString()};await savePreferences(await getDatabase(),next);set({preferences:next});},clear(){set({preferences:null,loading:false});}}));
