import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { PrismaService } from '../prisma/prisma.service';
import { RECEIPT_STORAGE, type ReceiptStorage } from './receipt-storage.service';

export type UploadedReceipt={buffer:Buffer;mimetype:string;originalname:string;size:number;};
const allowed=new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp']]);
const maxBytes=5*1024*1024;
const view={id:true,expenseId:true,originalName:true,mimeType:true,sizeBytes:true,checksumSha256:true,createdAt:true} as const;

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma:PrismaService,@Inject(RECEIPT_STORAGE) private readonly storage:ReceiptStorage) {}
  async upload(userId:string,expenseId:string,file:UploadedReceipt){await this.expense(userId,expenseId);const extension=this.validate(file),originalName=this.name(file.originalname);const checksumSha256=createHash('sha256').update(file.buffer).digest('hex');const duplicate=await this.prisma.receipt.findFirst({where:{expenseId,checksumSha256}});if(duplicate)throw new ConflictException('An identical receipt already exists for this expense.');const id=randomUUID(),storageKey=`${userId}/${expenseId}/${id}.${extension}`;try{await this.storage.save(storageKey,file.buffer);}catch{throw new InternalServerErrorException('Unable to store receipt.');}try{return await this.prisma.receipt.create({data:{id,expenseId,userId,storageKey,originalName,mimeType:file.mimetype,sizeBytes:file.size,checksumSha256},select:view});}catch(error:unknown){await this.removeSafely(storageKey);if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('An identical receipt already exists for this expense.');throw error;}}
  async list(userId:string,expenseId:string){await this.expense(userId,expenseId);return this.prisma.receipt.findMany({where:{expenseId,userId,deletedAt:null},select:view,orderBy:{createdAt:'desc'}});}
  async open(userId:string,expenseId:string,id:string):Promise<{receipt:Awaited<ReturnType<ReceiptsService['find']>>;stream:Readable}>{const receipt=await this.find(userId,expenseId,id);try{return {receipt,stream:await this.storage.open(receipt.storageKey)};}catch{throw new NotFoundException('Receipt file not found.');}}
  async remove(userId:string,expenseId:string,id:string){const receipt=await this.find(userId,expenseId,id);await this.prisma.receipt.update({where:{id:receipt.id},data:{deletedAt:new Date()}});await this.removeSafely(receipt.storageKey);return {deleted:true};}
  private async expense(userId:string,id:string){const expense=await this.prisma.expense.findFirst({where:{id,userId,groupId:null,deletedAt:null},select:{id:true}});if(!expense)throw new NotFoundException('Expense not found.');return expense;}
  private async find(userId:string,expenseId:string,id:string){const receipt=await this.prisma.receipt.findFirst({where:{id,expenseId,userId,deletedAt:null}});if(!receipt)throw new NotFoundException('Receipt not found.');return receipt;}
  private validate(file:UploadedReceipt){const extension=allowed.get(file.mimetype);if(!extension)throw new BadRequestException('Receipt must be a JPEG, PNG, or WebP image.');if(!Buffer.isBuffer(file.buffer)||file.size<1||file.size!==file.buffer.length||file.size>maxBytes)throw new BadRequestException('Receipt must be no larger than 5 MB.');return extension;}
  private name(value:string){if(!value||value.length>255||value.includes('/')||value.includes('\\')||value.includes('\0'))throw new BadRequestException('Invalid receipt filename.');return value;}
  private async removeSafely(storageKey:string){try{await this.storage.remove(storageKey);}catch{/* Metadata safety does not depend on best-effort local cleanup. */}}
}
