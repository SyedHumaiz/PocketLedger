import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, CategoriesModule, ExpensesModule],
  controllers: [HealthController],
})
export class AppModule {}
