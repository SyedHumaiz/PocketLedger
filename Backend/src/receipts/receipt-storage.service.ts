import { Injectable } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import type { Readable } from 'node:stream';

export interface ReceiptStorage { save(storageKey:string,content:Buffer):Promise<void>; open(storageKey:string):Promise<Readable>; remove(storageKey:string):Promise<void>; }
export const RECEIPT_STORAGE='RECEIPT_STORAGE';

@Injectable()
export class LocalReceiptStorageService implements ReceiptStorage {
  private readonly root=resolve(process.env.RECEIPT_UPLOAD_DIR?.trim()||resolve(process.cwd(),'uploads','receipts'));
  async save(storageKey:string,content:Buffer):Promise<void>{const path=this.pathFor(storageKey);await mkdir(resolve(path,'..'),{recursive:true});await writeFile(path,content,{flag:'wx'});}
  async open(storageKey:string):Promise<Readable>{return createReadStream(this.pathFor(storageKey));}
  async remove(storageKey:string):Promise<void>{await rm(this.pathFor(storageKey),{force:true});}
  private pathFor(storageKey:string):string{if(!/^[0-9a-f-]+\/[0-9a-f-]+\/[0-9a-f-]+\.(?:jpg|png|webp)$/i.test(storageKey)||basename(storageKey)!==storageKey.split('/').at(-1))throw new Error('Invalid receipt storage key.');const path=resolve(this.root,...storageKey.split('/'));if(!path.startsWith(`${this.root}${sep}`))throw new Error('Invalid receipt storage key.');return path;}
}
