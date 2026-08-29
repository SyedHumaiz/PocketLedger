import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

const safeCategorySelection = {
  id: true,
  name: true,
} as const;

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId, groupId: null, deletedAt: null },
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
      include: { category: { select: safeCategorySelection } },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId, groupId: null, deletedAt: null },
      include: { category: { select: safeCategorySelection } },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found.');
    }

    return expense;
  }

  async create(userId: string, dto: CreateExpenseDto) {
    await this.verifyCategoryOwnership(userId, dto.categoryId);

    return this.prisma.expense.create({
      data: {
        userId,
        paidByUserId: userId,
        categoryId: dto.categoryId,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        description: dto.description,
        expenseDate: this.toExpenseDate(dto.expenseDate),
        version: 1,
      },
      include: { category: { select: safeCategorySelection } },
    });
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.findOne(userId, id);

    if (dto.categoryId && dto.categoryId !== expense.categoryId) {
      await this.verifyCategoryOwnership(userId, dto.categoryId);
    }

    const data: Prisma.ExpenseUpdateInput = {
      version: { increment: 1 },
    };

    if (dto.amountMinor !== undefined) {
      data.amountMinor = dto.amountMinor;
    }
    if (dto.currency !== undefined) {
      data.currency = dto.currency;
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.expenseDate !== undefined) {
      data.expenseDate = this.toExpenseDate(dto.expenseDate);
    }
    if (dto.categoryId !== undefined) {
      data.category = { connect: { id: dto.categoryId } };
    }

    try {
      return await this.prisma.expense.update({
        where: { id },
        data,
        include: { category: { select: safeCategorySelection } },
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException('Expense not found.');
      }

      throw error;
    }
  }

  async remove(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId, groupId: null },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found.');
    }

    if (expense.deletedAt) {
      return expense;
    }

    try {
      return await this.prisma.expense.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: { increment: 1 },
        },
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException('Expense not found.');
      }

      throw error;
    }
  }

  private async verifyCategoryOwnership(userId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }
  }

  private toExpenseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private isPrismaError(error: unknown, code: string): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
    );
  }
}
