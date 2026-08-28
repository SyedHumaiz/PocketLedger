import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

type AuthenticatedRequest = ExpressRequest & { user: JwtPayload };

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @Request() request: AuthenticatedRequest,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(request.user.sub, dto);
  }

  @Get()
  findAll(@Request() request: AuthenticatedRequest) {
    return this.expensesService.findAll(request.user.sub);
  }

  @Get(':id')
  findOne(
    @Request() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.expensesService.findOne(request.user.sub, id);
  }

  @Patch(':id')
  update(
    @Request() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(request.user.sub, id, dto);
  }

  @Delete(':id')
  remove(
    @Request() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.expensesService.remove(request.user.sub, id);
  }
}
