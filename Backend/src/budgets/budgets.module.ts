import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
@Module({ controllers: [BudgetsController], providers: [BudgetsService, PrismaService] })
export class BudgetsModule {}
