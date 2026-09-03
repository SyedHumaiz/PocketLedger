import { BadRequestException, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Request, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReceiptsService, type UploadedReceipt } from './receipts.service';

type AuthenticatedRequest=ExpressRequest&{user:JwtPayload};
@Controller('expenses/:expenseId/receipts') @UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(private readonly receipts:ReceiptsService) {}
  @Post() @UseInterceptors(FileInterceptor('file',{limits:{fileSize:5*1024*1024}})) upload(@Request() request:AuthenticatedRequest,@Param('expenseId',new ParseUUIDPipe()) expenseId:string,@UploadedFile() file:UploadedReceipt|undefined){if(!file)throw new BadRequestException('Receipt file is required.');return this.receipts.upload(request.user.sub,expenseId,file);}
  @Get() list(@Request() request:AuthenticatedRequest,@Param('expenseId',new ParseUUIDPipe()) expenseId:string){return this.receipts.list(request.user.sub,expenseId);}
  @Get(':receiptId') async open(@Request() request:AuthenticatedRequest,@Param('expenseId',new ParseUUIDPipe()) expenseId:string,@Param('receiptId',new ParseUUIDPipe()) receiptId:string){const {receipt,stream}=await this.receipts.open(request.user.sub,expenseId,receiptId);return new StreamableFile(stream,{type:receipt.mimeType,disposition:`inline; filename="${receipt.originalName.replace(/["\\]/g,'_')}"`});}
  @Delete(':receiptId') remove(@Request() request:AuthenticatedRequest,@Param('expenseId',new ParseUUIDPipe()) expenseId:string,@Param('receiptId',new ParseUUIDPipe()) receiptId:string){return this.receipts.remove(request.user.sub,expenseId,receiptId);}
}
