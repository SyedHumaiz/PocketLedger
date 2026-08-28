import * as SecureStore from 'expo-secure-store';
export interface SecureStoreLike { getItemAsync(key:string):Promise<string|null>; setItemAsync(key:string,value:string):Promise<void>; deleteItemAsync(key:string):Promise<void>; }
export function createTokenStorage(store:SecureStoreLike){const key='pocketledger.access-token';return {async get(){try{return await store.getItemAsync(key);}catch{throw new Error('Unable to read the secure access token.');}},async save(token:string){try{await store.setItemAsync(key,token);}catch{throw new Error('Unable to save the secure access token.');}},async remove(){try{await store.deleteItemAsync(key);}catch{throw new Error('Unable to remove the secure access token.');}}};}
export const tokenStorage=createTokenStorage(SecureStore);
