import type { ReceiptSyncStatus } from '../db/types';
export const isRetryableReceiptFailure=(status:number|null|undefined)=>status===null||status===undefined||status>=500;
export const canUploadReceipt=(expenseStatus:string,receiptStatus:ReceiptSyncStatus,deletedAt:string|null)=>expenseStatus==='SYNCED'&&receiptStatus==='PENDING'&&deletedAt===null;
export const recoveredReceiptStatus=(status:ReceiptSyncStatus,updatedAt:string,staleBefore:string):ReceiptSyncStatus=>status==='UPLOADING'&&updatedAt<staleBefore?'PENDING':status;
export const receiptUploadTransition=(success:boolean,retryable:boolean):ReceiptSyncStatus=>success?'SYNCED':retryable?'PENDING':'FAILED';
