import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupExpensesController } from './group-expenses.controller';
import { GroupExpensesService } from './group-expenses.service';
import { GroupSettlementsController } from './group-settlements.controller';
import { GroupSettlementsService } from './group-settlements.service';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({imports:[NotificationsModule],controllers:[GroupsController,GroupExpensesController,GroupSettlementsController],providers:[GroupsService,GroupExpensesService,GroupSettlementsService,PrismaService]})
export class GroupsModule {}
