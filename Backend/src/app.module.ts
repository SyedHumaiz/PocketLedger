import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SyncModule } from './sync/sync.module';
import { HealthController } from './health.controller';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [AuthModule, CategoriesModule, ExpensesModule, BudgetsModule, SyncModule, GroupsModule],
  controllers: [HealthController],
})
export class AppModule {}
