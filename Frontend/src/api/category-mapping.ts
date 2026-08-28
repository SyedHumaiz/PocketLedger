import type { LocalCategoryRecord } from '../db/types';
export interface CategoryResponse { id:string; name:string; normalizedName:string; createdAt:string; updatedAt:string; }
export function mapCategoryResponse(category:CategoryResponse,userId:string):LocalCategoryRecord{return {id:category.id,userId,name:category.name,normalizedName:category.normalizedName,createdAt:category.createdAt,updatedAt:category.updatedAt,deletedAt:null,syncStatus:'SYNCED'};}
