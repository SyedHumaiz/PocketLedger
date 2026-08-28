import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SyncModule } from './sync/sync.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, CategoriesModule, ExpensesModule, BudgetsModule, SyncModule],
  controllers: [HealthController],
})
export class AppModule {}
