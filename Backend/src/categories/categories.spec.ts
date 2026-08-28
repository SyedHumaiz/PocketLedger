import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Category } from '@prisma/client';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

const testJwtSecret = 'a5e1f4c9b7d2a8e6f3c1b9d4e7a2f5c8b6d3e9a1f4c7b2d8';
const firstUserId = '11111111-1111-4111-8111-111111111111';
const secondUserId = '22222222-2222-4222-8222-222222222222';

interface CategoryWhere {
  id?: string;
  userId: string;
  normalizedName?: string;
  NOT?: { id: string };
}

describe('CategoriesController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let categories: Category[];
  let referencedCategoryIds: Set<string>;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    expense: {
      count: jest.fn(),
    },
  };

  const authorizationFor = (userId: string): string => {
    const accessToken = jwtService.sign({
      sub: userId,
      email: `${userId}@example.test`,
    });
    return `Bearer ${accessToken}`;
  };

  const createCategory = async (
    userId: string,
    name: string,
  ): Promise<Category> => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', authorizationFor(userId))
      .send({ name })
      .expect(201);

    return response.body as Category;
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = testJwtSecret;
    process.env.JWT_EXPIRES_IN = '15m';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    jwtService = app.get(JwtService);
  });

  beforeEach(() => {
    categories = [];
    referencedCategoryIds = new Set();
    jest.clearAllMocks();

    prismaMock.category.findMany.mockImplementation(
      async ({ where }: { where: { userId: string } }) =>
        categories
          .filter((category) => category.userId === where.userId)
          .sort((first, second) => first.name.localeCompare(second.name)),
    );
    prismaMock.category.findFirst.mockImplementation(
      async ({ where }: { where: CategoryWhere }) =>
        categories.find(
          (category) =>
            category.userId === where.userId &&
            (!where.id || category.id === where.id) &&
            (!where.normalizedName ||
              category.normalizedName === where.normalizedName) &&
            (!where.NOT || category.id !== where.NOT.id),
        ) ?? null,
    );
    prismaMock.category.create.mockImplementation(
      async ({
        data,
      }: {
        data: Pick<Category, 'userId' | 'name' | 'normalizedName'>;
      }) => {
        const category: Category = {
          id: `00000000-0000-4000-8000-${String(categories.length + 1).padStart(12, '0')}`,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          ...data,
        };
        categories.push(category);
        return category;
      },
    );
    prismaMock.category.update.mockImplementation(
      async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Pick<Category, 'name' | 'normalizedName'>;
      }) => {
        const category = categories.find((item) => item.id === where.id);
        if (!category) {
          throw new Error('Category missing from test fixture.');
        }

        Object.assign(category, data, {
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        });
        return category;
      },
    );
    prismaMock.category.delete.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const index = categories.findIndex((category) => category.id === where.id);
        if (index === -1) {
          throw new Error('Category missing from test fixture.');
        }

        return categories.splice(index, 1)[0];
      },
    );
    prismaMock.expense.count.mockImplementation(
      async ({ where }: { where: { categoryId: string } }) =>
        referencedCategoryIds.has(where.categoryId) ? 1 : 0,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a category for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', authorizationFor(firstUserId))
      .send({ name: '  Groceries  ' })
      .expect(201);

    expect(response.body).toMatchObject({
      userId: firstUserId,
      name: 'Groceries',
      normalizedName: 'groceries',
    });
  });

  it('rejects unauthenticated category requests', async () => {
    await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Groceries' })
      .expect(401);
  });

  it('lists categories only for the authenticated user in name order', async () => {
    await createCategory(firstUserId, 'Transport');
    await createCategory(firstUserId, 'Books');
    await createCategory(secondUserId, 'Bills');

    const response = await request(app.getHttpServer())
      .get('/categories')
      .set('Authorization', authorizationFor(firstUserId))
      .expect(200);

    expect(response.body.map((category: Category) => category.name)).toEqual([
      'Books',
      'Transport',
    ]);
  });

  it('rejects duplicate normalized names for the same user', async () => {
    await createCategory(firstUserId, 'Groceries');

    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', authorizationFor(firstUserId))
      .send({ name: 'GROCERIES' })
      .expect(409);
  });

  it('allows the same category name for different users', async () => {
    await createCategory(firstUserId, 'Groceries');

    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', authorizationFor(secondUserId))
      .send({ name: 'Groceries' })
      .expect(201);

    expect(response.body.userId).toBe(secondUserId);
  });

  it('returns 404 when updating a category owned by another user', async () => {
    const category = await createCategory(secondUserId, 'Groceries');

    await request(app.getHttpServer())
      .patch(`/categories/${category.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .send({ name: 'Food' })
      .expect(404);

    expect(category.name).toBe('Groceries');
  });

  it('returns 404 when deleting a category owned by another user', async () => {
    const category = await createCategory(secondUserId, 'Groceries');

    await request(app.getHttpServer())
      .delete(`/categories/${category.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .expect(404);

    expect(categories.some((item) => item.id === category.id)).toBe(true);
  });

  it('returns a conflict when deleting a category referenced by expenses', async () => {
    const category = await createCategory(firstUserId, 'Groceries');
    referencedCategoryIds.add(category.id);

    const response = await request(app.getHttpServer())
      .delete(`/categories/${category.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .expect(409);

    expect(response.body.message).toBe(
      'Category cannot be deleted because it is referenced by expenses.',
    );
    expect(categories.some((item) => item.id === category.id)).toBe(true);
  });

});
