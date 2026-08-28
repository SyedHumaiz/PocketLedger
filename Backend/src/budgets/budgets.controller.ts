import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetsService } from './budgets.service';
import { BudgetQueryDto } from './dto/budget-query.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
type AuthenticatedRequest = ExpressRequest & { user: JwtPayload };

@Controller('budgets') @UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}
  @Post() create(@Request() request: AuthenticatedRequest, @Body() dto: CreateBudgetDto) { return this.budgetsService.create(request.user.sub, dto); }
  @Get() findAll(@Request() request: AuthenticatedRequest, @Query() query: BudgetQueryDto) { return this.budgetsService.findAll(request.user.sub, query); }
  @Get(':id') findOne(@Request() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string) { return this.budgetsService.findOne(request.user.sub, id); }
  @Patch(':id') update(@Request() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateBudgetDto) { return this.budgetsService.update(request.user.sub, id, dto); }
  @Delete(':id') remove(@Request() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string) { return this.budgetsService.remove(request.user.sub, id); }
}
