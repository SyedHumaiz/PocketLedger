import { api } from './client';
export { mapCategoryResponse, type CategoryResponse } from './category-mapping';
import type { CategoryResponse } from './category-mapping';
export const getCategories=async():Promise<CategoryResponse[]>=>(await api.get<CategoryResponse[]>('/categories')).data;
export const createCategory=async(name:string):Promise<CategoryResponse>=>(await api.post<CategoryResponse>('/categories',{name})).data;
export const updateCategory=async(id:string,name:string):Promise<CategoryResponse>=>(await api.patch<CategoryResponse>(`/categories/${id}`,{name})).data;
export const deleteCategory=async(id:string):Promise<void>=>{await api.delete(`/categories/${id}`);};
