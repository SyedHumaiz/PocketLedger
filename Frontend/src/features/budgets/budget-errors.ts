import { toApiError } from '../../api/api-error';
export function budgetMutationError(error:unknown):string{const api=toApiError(error);if(api.status===409)return api.message||'A budget already exists for that period and category.';if(api.status===404)return 'The budget or selected category no longer exists. Refresh and try again.';return api.message;}
