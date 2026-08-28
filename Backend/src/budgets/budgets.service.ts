import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetQueryDto } from './dto/budget-query.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

const categorySelect = { id: true, name: true } as const;

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, query: BudgetQueryDto) {
    return this.prisma.budget.findMany({
      where: { userId, ...(query.month !== undefined && { month: query.month }), ...(query.year !== undefined && { year: query.year }) },
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { categoryId: 'asc' }],
      include: { category: { select: categorySelect } },
    });
  }

  async findOne(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId }, include: { category: { select: categorySelect } } });
    if (!budget) throw new NotFoundException('Budget not found.');
    return budget;
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const categoryId = dto.categoryId ?? null;
    if (categoryId) await this.verifyCategory(userId, categoryId);
    await this.ensureAvailable(userId, categoryId, dto.month, dto.year);
    try {
      return await this.prisma.budget.create({ data: { userId, categoryId, amountMinor: dto.amountMinor, month: dto.month, year: dto.year }, include: { category: { select: categorySelect } } });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2002')) throw new ConflictException('A budget already exists for this period and category.');
      throw error;
    }
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.findOne(userId, id);
    const categoryId = dto.categoryId === undefined ? budget.categoryId : dto.categoryId;
    const month = dto.month ?? budget.month;
    const year = dto.year ?? budget.year;
    if (dto.categoryId !== undefined && categoryId) await this.verifyCategory(userId, categoryId);
    await this.ensureAvailable(userId, categoryId, month, year, id);
    const data: Prisma.BudgetUpdateInput = {};
    if (dto.amountMinor !== undefined) data.amountMinor = dto.amountMinor;
    if (dto.month !== undefined) data.month = dto.month;
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.categoryId !== undefined) data.category = dto.categoryId ? { connect: { id: dto.categoryId } } : { disconnect: true };
    try {
      return await this.prisma.budget.update({ where: { id }, data, include: { category: { select: categorySelect } } });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2002')) throw new ConflictException('A budget already exists for this period and category.');
      if (this.isPrismaError(error, 'P2025')) throw new NotFoundException('Budget not found.');
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    try { return await this.prisma.budget.delete({ where: { id } }); }
    catch (error: unknown) { if (this.isPrismaError(error, 'P2025')) throw new NotFoundException('Budget not found.'); throw error; }
  }

  private async verifyCategory(userId: string, categoryId: string) {
    if (!await this.prisma.category.findFirst({ where: { id: categoryId, userId } })) throw new NotFoundException('Category not found.');
  }
  private async ensureAvailable(userId: string, categoryId: string | null, month: number, year: number, excludeId?: string) {
    const existing = await this.prisma.budget.findFirst({ where: { userId, categoryId, month, year, ...(excludeId && { NOT: { id: excludeId } }) } });
    if (existing) throw new ConflictException('A budget already exists for this period and category.');
  }
  private isPrismaError(error: unknown, code: string): boolean { return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code; }
}
