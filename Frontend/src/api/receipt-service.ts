import { api } from './client';
import { tokenStorage } from '../auth/token-storage';
import { getApiBaseUrl } from './config';
export interface RemoteReceipt {id:string;expenseId:string;originalName:string;mimeType:string;sizeBytes:number;checksumSha256:string;createdAt:string;}
export type ReceiptUploadFile={uri:string;name:string;type:'image/jpeg'|'image/png'|'image/webp'};
export async function uploadReceipt(expenseId:string,file:ReceiptUploadFile):Promise<RemoteReceipt>{const form=new FormData();form.append('file',{uri:file.uri,name:file.name,type:file.type} as never);return (await api.post<RemoteReceipt>(`/expenses/${expenseId}/receipts`,form,{headers:{'Content-Type':'multipart/form-data'}})).data;}
const receiptPath=(expenseId:string,receiptId:string)=>`/expenses/${encodeURIComponent(expenseId)}/receipts/${encodeURIComponent(receiptId)}`;
export async function getRemoteReceipt(expenseId:string,receiptId:string):Promise<ArrayBuffer>{return (await api.get<ArrayBuffer>(receiptPath(expenseId,receiptId),{responseType:'arraybuffer'})).data;}
export async function authorizedRemoteReceiptSource(expenseId:string,receiptId:string):Promise<{uri:string;headers:{Authorization:string}}|null>{const token=await tokenStorage.get();if(!token)return null;return {uri:`${getApiBaseUrl()}${receiptPath(expenseId,receiptId)}`,headers:{Authorization:`Bearer ${token}`}};}
export async function deleteRemoteReceipt(expenseId:string,receiptId:string):Promise<void>{await api.delete(`/expenses/${expenseId}/receipts/${receiptId}`);}
