import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Category, Expense } from '@prisma/client';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

const testJwtSecret = 'a5e1f4c9b7d2a8e6f3c1b9d4e7a2f5c8b6d3e9a1f4c7b2d8';
const firstUserId = '11111111-1111-4111-8111-111111111111';
const secondUserId = '22222222-2222-4222-8222-222222222222';

interface ExpenseWhere {
  id?: string;
  userId: string;
  deletedAt?: null;
}

interface ExpenseUpdateData {
  amountMinor?: number;
  currency?: string;
  description?: string;
  expenseDate?: Date;
  deletedAt?: Date;
  version: { increment: number };
  category?: { connect: { id: string } };
}

describe('ExpensesController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let categories: Category[];
  let expenses: Expense[];

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
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const authorizationFor = (userId: string): string => {
    const accessToken = jwtService.sign({
      sub: userId,
      email: `${userId}@example.test`,
    });
    return `Bearer ${accessToken}`;
  };

  const addCategory = (userId: string, name: string): Category => {
    const category: Category = {
      id: `00000000-0000-4000-8000-${String(categories.length + 1).padStart(12, '0')}`,
      userId,
      name,
      normalizedName: name.toLowerCase(),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    categories.push(category);
    return category;
  };

  const createExpense = async (userId: string, categoryId: string) => {
    const response = await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', authorizationFor(userId))
      .send({
        amountMinor: 1_250,
        currency: 'USD',
        description: 'Coffee and breakfast',
        expenseDate: '2026-01-15',
        categoryId,
      })
      .expect(201);

    return response.body as Expense;
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
    expenses = [];
    jest.clearAllMocks();

    prismaMock.category.findFirst.mockImplementation(
      async ({ where }: { where: { id: string; userId: string } }) =>
        categories.find(
          (category) =>
            category.id === where.id && category.userId === where.userId,
        ) ?? null,
    );
    prismaMock.expense.findMany.mockImplementation(
      async ({ where }: { where: ExpenseWhere }) =>
        expenses
          .filter(
            (expense) =>
              expense.userId === where.userId &&
              (where.deletedAt !== null || expense.deletedAt === null),
          )
          .sort(
            (first, second) =>
              second.expenseDate.getTime() - first.expenseDate.getTime() ||
              second.createdAt.getTime() - first.createdAt.getTime(),
          )
          .map((expense) => withCategory(expense)),
    );
    prismaMock.expense.findFirst.mockImplementation(
      async ({ where }: { where: ExpenseWhere }) => {
        const expense = expenses.find(
          (item) =>
            item.userId === where.userId &&
            (!where.id || item.id === where.id) &&
            (where.deletedAt !== null || item.deletedAt === null),
        );
        return expense ? withCategory(expense) : null;
      },
    );
    prismaMock.expense.create.mockImplementation(
      async ({
        data,
      }: {
        data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
      }) => {
        const expense: Expense = {
          id: `10000000-0000-4000-8000-${String(expenses.length + 1).padStart(12, '0')}`,
          createdAt: new Date('2026-01-15T12:00:00.000Z'),
          updatedAt: new Date('2026-01-15T12:00:00.000Z'),
          deletedAt: null,
          ...data,
        };
        expenses.push(expense);
        return withCategory(expense);
      },
    );
    prismaMock.expense.update.mockImplementation(
      async ({ where, data }: { where: { id: string }; data: ExpenseUpdateData }) => {
        const expense = expenses.find((item) => item.id === where.id);
        if (!expense) {
          throw new Error('Expense missing from test fixture.');
        }

        Object.assign(expense, {
          amountMinor: data.amountMinor ?? expense.amountMinor,
          currency: data.currency ?? expense.currency,
          description: data.description ?? expense.description,
          expenseDate: data.expenseDate ?? expense.expenseDate,
          categoryId: data.category?.connect.id ?? expense.categoryId,
          deletedAt: data.deletedAt ?? expense.deletedAt,
          version: expense.version + data.version.increment,
          updatedAt: new Date('2026-01-16T12:00:00.000Z'),
        });
        return withCategory(expense);
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an expense for the authenticated user', async () => {
    const category = addCategory(firstUserId, 'Food');
    const response = await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', authorizationFor(firstUserId))
      .send({
        amountMinor: 1_250,
        currency: 'USD',
        description: '  Coffee and breakfast  ',
        expenseDate: '2026-01-15',
        categoryId: category.id,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      userId: firstUserId,
      paidByUserId: firstUserId,
      categoryId: category.id,
      amountMinor: 1_250,
      description: 'Coffee and breakfast',
      version: 1,
      category: { id: category.id, name: 'Food' },
    });
  });

  it('rejects unauthenticated expense requests', async () => {
    await request(app.getHttpServer()).get('/expenses').expect(401);
  });

  it('rejects non-positive and non-integer amounts', async () => {
    const category = addCategory(firstUserId, 'Food');

    await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', authorizationFor(firstUserId))
      .send({
        amountMinor: 0,
        currency: 'USD',
        description: 'Coffee',
        expenseDate: '2026-01-15',
        categoryId: category.id,
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', authorizationFor(firstUserId))
      .send({
        amountMinor: 1.5,
        currency: 'USD',
        description: 'Coffee',
        expenseDate: '2026-01-15',
        categoryId: category.id,
      })
      .expect(400);
  });

  it('rejects invalid currency and date values', async () => {
    const category = addCategory(firstUserId, 'Food');
    const payload = {
      amountMinor: 100,
      currency: 'usd',
      description: 'Coffee',
      expenseDate: '2026-01-15',
      categoryId: category.id,
    };

    await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', authorizationFor(firstUserId))
      .send(payload)
      .expect(400);
    await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', authorizationFor(firstUserId))
      .send({ ...payload, currency: 'USD', expenseDate: '2026-02-30' })
      .expect(400);
  });

  it('rejects a foreign category during creation', async () => {
    const foreignCategory = addCategory(secondUserId, 'Food');

    await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', authorizationFor(firstUserId))
      .send({
        amountMinor: 100,
        currency: 'USD',
        description: 'Coffee',
        expenseDate: '2026-01-15',
        categoryId: foreignCategory.id,
      })
      .expect(404);
  });

  it('isolates expense lists between users', async () => {
    const firstCategory = addCategory(firstUserId, 'Food');
    const secondCategory = addCategory(secondUserId, 'Food');
    await createExpense(firstUserId, firstCategory.id);
    await createExpense(secondUserId, secondCategory.id);

    const response = await request(app.getHttpServer())
      .get('/expenses')
      .set('Authorization', authorizationFor(firstUserId))
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].userId).toBe(firstUserId);
  });

  it('returns 404 for get, update, and delete attempts on a foreign expense', async () => {
    const category = addCategory(secondUserId, 'Food');
    const expense = await createExpense(secondUserId, category.id);

    await request(app.getHttpServer())
      .get(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .send({ description: 'Changed' })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .expect(404);
  });

  it('rejects a foreign category during an update', async () => {
    const ownCategory = addCategory(firstUserId, 'Food');
    const foreignCategory = addCategory(secondUserId, 'Travel');
    const expense = await createExpense(firstUserId, ownCategory.id);

    await request(app.getHttpServer())
      .patch(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .send({ categoryId: foreignCategory.id })
      .expect(404);
  });

  it('increments version on successful updates', async () => {
    const category = addCategory(firstUserId, 'Food');
    const expense = await createExpense(firstUserId, category.id);

    const response = await request(app.getHttpServer())
      .patch(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .send({ description: 'Lunch' })
      .expect(200);

    expect(response.body).toMatchObject({ description: 'Lunch', version: 2 });
  });

  it('soft deletes an expense and excludes it from normal reads', async () => {
    const category = addCategory(firstUserId, 'Food');
    const expense = await createExpense(firstUserId, category.id);

    const deletion = await request(app.getHttpServer())
      .delete(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .expect(200);

    expect(deletion.body.version).toBe(2);
    expect(deletion.body.deletedAt).toEqual(expect.any(String));
    await request(app.getHttpServer())
      .get(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .expect(404);
    await request(app.getHttpServer())
      .get('/expenses')
      .set('Authorization', authorizationFor(firstUserId))
      .expect([]);
  });

  it('treats repeated owner deletes as idempotent', async () => {
    const category = addCategory(firstUserId, 'Food');
    const expense = await createExpense(firstUserId, category.id);

    const firstDeletion = await request(app.getHttpServer())
      .delete(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .expect(200);
    const repeatedDeletion = await request(app.getHttpServer())
      .delete(`/expenses/${expense.id}`)
      .set('Authorization', authorizationFor(firstUserId))
      .expect(200);

    expect(firstDeletion.body.version).toBe(2);
    expect(repeatedDeletion.body.version).toBe(2);
    expect(repeatedDeletion.body.deletedAt).toBe(firstDeletion.body.deletedAt);
  });

  function withCategory(expense: Expense): Expense & { category: Category } {
    const category = categories.find((item) => item.id === expense.categoryId);
    if (!category) {
      throw new Error('Category missing from test fixture.');
    }

    return { ...expense, category };
  }
});
