import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceiptsController } from './receipts.controller';
import { LocalReceiptStorageService, RECEIPT_STORAGE } from './receipt-storage.service';
import { ReceiptsService } from './receipts.service';
@Module({controllers:[ReceiptsController],providers:[ReceiptsService,LocalReceiptStorageService,{provide:RECEIPT_STORAGE,useExisting:LocalReceiptStorageService},PrismaService]}) export class ReceiptsModule {}
