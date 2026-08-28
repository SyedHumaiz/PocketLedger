import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const normalizedName = this.normalizeName(dto.name);
    const existingCategory = await this.prisma.category.findFirst({
      where: { userId, normalizedName },
    });

    if (existingCategory) {
      throw new ConflictException('A category with this name already exists.');
    }

    try {
      return await this.prisma.category.create({
        data: { userId, name: dto.name, normalizedName },
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2002')) {
        throw new ConflictException('A category with this name already exists.');
      }

      throw error;
    }
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOwnedCategory(userId, id);

    const normalizedName = this.normalizeName(dto.name);
    const duplicateCategory = await this.prisma.category.findFirst({
      where: {
        userId,
        normalizedName,
        NOT: { id },
      },
    });

    if (duplicateCategory) {
      throw new ConflictException('A category with this name already exists.');
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: { name: dto.name, normalizedName },
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2002')) {
        throw new ConflictException('A category with this name already exists.');
      }

      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException('Category not found.');
      }

      throw error;
    }
  }

  async remove(userId: string, id: string) {
    await this.findOwnedCategory(userId, id);

    const expenseCount = await this.prisma.expense.count({
      where: { categoryId: id },
    });

    if (expenseCount > 0) {
      throw new ConflictException(
        'Category cannot be deleted because it is referenced by expenses.',
      );
    }

    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException('Category not found.');
      }

      if (this.isPrismaError(error, 'P2003')) {
        throw new ConflictException(
          'Category cannot be deleted while it is still referenced.',
        );
      }

      throw error;
    }
  }

  private async findOwnedCategory(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  private normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  private isPrismaError(error: unknown, code: string): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
    );
  }
}
