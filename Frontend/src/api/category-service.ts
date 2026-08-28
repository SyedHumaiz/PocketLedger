import { api } from './client';
export { mapCategoryResponse, type CategoryResponse } from './category-mapping';
import type { CategoryResponse } from './category-mapping';
export const getCategories=async():Promise<CategoryResponse[]>=>(await api.get<CategoryResponse[]>('/categories')).data;
