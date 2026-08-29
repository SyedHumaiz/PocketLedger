import { toApiError } from '../../api/api-error';
export function categoryMutationError(error:unknown):string { const api=toApiError(error); if(api.status===409)return api.message||'That category name is already in use.'; if(api.status===404)return 'This category no longer exists. Refresh and try again.'; return api.message; }
