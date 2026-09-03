import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../auth/auth.types'; import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SyncExpenseDto } from './dto/sync-expense.dto'; import { SyncService } from './sync.service';
import { SyncGroupExpenseDto } from './dto/sync-group-expense.dto';
@Controller('sync') @UseGuards(JwtAuthGuard)
export class SyncController { constructor(private readonly sync:SyncService){} @Post('expenses') syncExpense(@Request() req:ExpressRequest&{user:JwtPayload},@Body() dto:SyncExpenseDto){return this.sync.syncExpense(req.user.sub,dto);} @Post('group-expenses') syncGroupExpense(@Request() req:ExpressRequest&{user:JwtPayload},@Body() dto:SyncGroupExpenseDto){return this.sync.syncGroupExpense(req.user.sub,dto);} }
