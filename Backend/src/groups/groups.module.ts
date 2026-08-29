import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupExpensesController } from './group-expenses.controller';
import { GroupExpensesService } from './group-expenses.service';
@Module({controllers:[GroupsController,GroupExpensesController],providers:[GroupsService,GroupExpensesService,PrismaService]})
export class GroupsModule {}
