import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { getCategories } from '../api/category-service';
import { mapCategoryResponse } from '../api/category-mapping';
import { getDatabase } from '../db/database';
import { upsertLocalCategories } from '../db/category-repository';
import { createCategoryCache } from './category-cache-core';

export async function refreshCategoryCache(userId:string):Promise<void>{const categories=await getCategories();const db=await getDatabase();await upsertLocalCategories(db,userId,categories.map(category=>mapCategoryResponse(category,userId)));}
export function useCategoryCache(isLoading:boolean,isAuthenticated:boolean,userId:string|undefined):void{const currentUserId=useRef<string|undefined>(undefined);const previousUserId=useRef<string|undefined>(undefined);currentUserId.current=userId;const controller=useRef(createCategoryCache({addEventListener:listener=>NetInfo.addEventListener(listener),fetch:()=>NetInfo.fetch(),refresh:async()=>{const id=currentUserId.current;if(id)await refreshCategoryCache(id);}}));useEffect(()=>()=>controller.current.dispose(),[]);useEffect(()=>{if(previousUserId.current!==undefined&&previousUserId.current!==userId)controller.current.dispose();previousUserId.current=userId;controller.current.updateAuth({isLoading,isAuthenticated:isAuthenticated&&userId!==undefined});},[isLoading,isAuthenticated,userId]);}
