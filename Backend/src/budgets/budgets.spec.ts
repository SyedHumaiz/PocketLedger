import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Budget, Category } from '@prisma/client';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

const secret = 'a5e1f4c9b7d2a8e6f3c1b9d4e7a2f5c8b6d3e9a1f4c7b2d8';
const userOne = '11111111-1111-4111-8111-111111111111';
const userTwo = '22222222-2222-4222-8222-222222222222';

describe('BudgetsController', () => {
  let app: INestApplication; let jwt: JwtService; let categories: Category[]; let budgets: Budget[];
  const prisma = { user: { findUnique: jest.fn(), create: jest.fn() }, category: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() }, expense: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() }, budget: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
  const auth = (id: string) => `Bearer ${jwt.sign({ sub: id, email: `${id}@test` })}`;
  const addCategory = (userId: string): Category => { const c: Category = { id: `00000000-0000-4000-8000-${String(categories.length + 1).padStart(12, '0')}`, userId, name: 'Food', normalizedName: 'food', createdAt: new Date(), updatedAt: new Date() }; categories.push(c); return c; };
  const create = async (userId: string, body: object) => (await request(app.getHttpServer()).post('/budgets').set('Authorization', auth(userId)).send(body).expect(201)).body as Budget;
  const base = (categoryId?: string | null) => ({ amountMinor: 50_000, month: 1, year: 2026, ...(categoryId !== undefined && { categoryId }) });
  const withCategory = (budget: Budget) => ({ ...budget, category: budget.categoryId ? categories.find((c) => c.id === budget.categoryId) : null });

  beforeAll(async () => {
    process.env.JWT_SECRET = secret; process.env.JWT_EXPIRES_IN = '15m';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(PrismaService).useValue(prisma).compile();
    app = moduleRef.createNestApplication(); app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })); await app.init(); jwt = app.get(JwtService);
  });
  beforeEach(() => {
    categories = []; budgets = []; jest.clearAllMocks();
    prisma.category.findFirst.mockImplementation(async ({ where }: any) => categories.find((c) => c.id === where.id && c.userId === where.userId) ?? null);
    prisma.budget.findMany.mockImplementation(async ({ where }: any) => budgets.filter((b) => b.userId === where.userId && (where.month === undefined || b.month === where.month) && (where.year === undefined || b.year === where.year)).sort((a, b) => a.year - b.year || a.month - b.month || (a.categoryId ?? '').localeCompare(b.categoryId ?? '')).map(withCategory));
    prisma.budget.findFirst.mockImplementation(async ({ where }: any) => { const b = budgets.find((x) => x.userId === where.userId && (!where.id || x.id === where.id) && (where.categoryId === undefined || x.categoryId === where.categoryId) && (where.month === undefined || x.month === where.month) && (where.year === undefined || x.year === where.year) && (!where.NOT || x.id !== where.NOT.id)); return b ? withCategory(b) : null; });
    prisma.budget.create.mockImplementation(async ({ data }: any) => { const b: Budget = { id: `10000000-0000-4000-8000-${String(budgets.length + 1).padStart(12, '0')}`, createdAt: new Date(), updatedAt: new Date(), ...data }; budgets.push(b); return withCategory(b); });
    prisma.budget.update.mockImplementation(async ({ where, data }: any) => { const b = budgets.find((x) => x.id === where.id); if (!b) throw new Error('missing'); Object.assign(b, { ...data, categoryId: data.category ? (data.category.connect?.id ?? null) : b.categoryId, updatedAt: new Date() }); return withCategory(b); });
    prisma.budget.delete.mockImplementation(async ({ where }: any) => { const i = budgets.findIndex((b) => b.id === where.id); return budgets.splice(i, 1)[0]; });
  });
  afterAll(async () => app.close());

  it('creates authenticated overall and category budgets', async () => { const category = addCategory(userOne); const overall = await create(userOne, base()); const specific = await create(userOne, base(category.id)); expect(overall.categoryId).toBeNull(); expect(specific.categoryId).toBe(category.id); });
  it('rejects unauthenticated requests and invalid amounts, months, and years', async () => { await request(app.getHttpServer()).get('/budgets').expect(401); await request(app.getHttpServer()).post('/budgets').set('Authorization', auth(userOne)).send({ ...base(), amountMinor: 0, month: 13, year: 1999 }).expect(400); });
  it('rejects foreign categories', async () => { const category = addCategory(userTwo); await request(app.getHttpServer()).post('/budgets').set('Authorization', auth(userOne)).send(base(category.id)).expect(404); });
  it('rejects duplicate overall and category budgets but allows another month', async () => { const category = addCategory(userOne); await create(userOne, base()); await request(app.getHttpServer()).post('/budgets').set('Authorization', auth(userOne)).send(base()).expect(409); await create(userOne, base(category.id)); await request(app.getHttpServer()).post('/budgets').set('Authorization', auth(userOne)).send(base(category.id)).expect(409); await create(userOne, { ...base(category.id), month: 2 }); });
  it('isolates list results by user', async () => { await create(userOne, base()); await create(userTwo, base()); const response = await request(app.getHttpServer()).get('/budgets?month=1&year=2026').set('Authorization', auth(userOne)).expect(200); expect(response.body).toHaveLength(1); expect(response.body[0].userId).toBe(userOne); });
  it('returns 404 for get, update, and delete of a foreign budget', async () => { const foreign = await create(userTwo, base()); await request(app.getHttpServer()).get(`/budgets/${foreign.id}`).set('Authorization', auth(userOne)).expect(404); await request(app.getHttpServer()).patch(`/budgets/${foreign.id}`).set('Authorization', auth(userOne)).send({ amountMinor: 1 }).expect(404); await request(app.getHttpServer()).delete(`/budgets/${foreign.id}`).set('Authorization', auth(userOne)).expect(404); });
  it('rejects update conflicts and foreign update categories', async () => { const first = await create(userOne, base()); await create(userOne, { ...base(), month: 2 }); await request(app.getHttpServer()).patch(`/budgets/${first.id}`).set('Authorization', auth(userOne)).send({ month: 2 }).expect(409); const foreignCategory = addCategory(userTwo); await request(app.getHttpServer()).patch(`/budgets/${first.id}`).set('Authorization', auth(userOne)).send({ categoryId: foreignCategory.id }).expect(404); });
  it('deletes an owned budget', async () => { const budget = await create(userOne, base()); await request(app.getHttpServer()).delete(`/budgets/${budget.id}`).set('Authorization', auth(userOne)).expect(200); await request(app.getHttpServer()).get(`/budgets/${budget.id}`).set('Authorization', auth(userOne)).expect(404); });
});
