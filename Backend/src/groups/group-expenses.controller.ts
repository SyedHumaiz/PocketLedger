import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GroupExpensesService } from './group-expenses.service';
import { GroupSettlementsService } from './group-settlements.service';
import { CreateGroupExpenseDto, UpdateGroupExpenseDto } from './dto/group-expense.dto';
type AuthenticatedRequest=ExpressRequest & {user:JwtPayload};
@Controller('groups/:groupId') @UseGuards(JwtAuthGuard)
export class GroupExpensesController {
 constructor(private readonly expenses:GroupExpensesService,private readonly settlements:GroupSettlementsService) {}
 @Post('expenses') create(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string,@Body() dto:CreateGroupExpenseDto){return this.expenses.create(r.user.sub,groupId,dto);}
 @Get('expenses') findAll(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string){return this.expenses.findAll(r.user.sub,groupId);}
 @Get('expenses/:expenseId') findOne(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string,@Param('expenseId',new ParseUUIDPipe()) expenseId:string){return this.expenses.findOne(r.user.sub,groupId,expenseId);}
 @Patch('expenses/:expenseId') update(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string,@Param('expenseId',new ParseUUIDPipe()) expenseId:string,@Body() dto:UpdateGroupExpenseDto){return this.expenses.update(r.user.sub,groupId,expenseId,dto);}
 @Delete('expenses/:expenseId') remove(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string,@Param('expenseId',new ParseUUIDPipe()) expenseId:string){return this.expenses.remove(r.user.sub,groupId,expenseId);}
 @Get('balances') balances(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string){return this.settlements.balances(r.user.sub,groupId);}
}
