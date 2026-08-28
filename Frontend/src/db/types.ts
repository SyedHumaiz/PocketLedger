export type SyncStatus = 'PENDING' | 'SYNCED' | 'FAILED';
export type SyncQueueStatus = SyncStatus | 'PROCESSING' | 'CONFLICT';
export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export interface LocalCategoryRecord { id:string; userId:string; name:string; normalizedName:string; createdAt:string; updatedAt:string; deletedAt:string|null; syncStatus:SyncStatus; }
export interface LocalExpenseRecord { id:string; userId:string; categoryId:string|null; amountMinor:number; currency:string; description:string; expenseDate:string; createdAt:string; updatedAt:string; version:number; deletedAt:string|null; syncStatus:SyncStatus; }
export interface LocalBudgetRecord { id:string; userId:string; categoryId:string|null; amountMinor:number; month:number; year:number; createdAt:string; updatedAt:string; deletedAt:string|null; syncStatus:SyncStatus; }
export interface SyncQueueRecord { operationId:string; entityType:string; entityId:string; operationType:SyncOperationType; payloadJson:string; attempts:number; status:SyncQueueStatus; lastError:string|null; nextAttemptAt:string|null; createdAt:string; updatedAt:string; }
export interface SyncConflictRecord { id:string; operationId:string; entityType:string; entityId:string; localPayloadJson:string; serverPayloadJson:string; createdAt:string; resolvedAt:string|null; }
export interface AppMetadataRecord { key:string; value:string; updatedAt:string; }
