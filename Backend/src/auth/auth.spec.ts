import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { User } from '@prisma/client';
import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

const testPassword = 'ValidPassword!123';
const testJwtSecret = 'a5e1f4c9b7d2a8e6f3c1b9d4e7a2f5c8b6d3e9a1f4c7b2d8';

describe('AuthController', () => {
  let app: INestApplication;
  let users: User[];

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
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
  });

  beforeEach(() => {
    users = [];
    jest.clearAllMocks();

    prismaMock.user.findUnique.mockImplementation(
      async ({ where }: { where: { id?: string; normalizedEmail?: string } }) =>
        users.find(
          (user) =>
            user.id === where.id ||
            user.normalizedEmail === where.normalizedEmail,
        ) ?? null,
    );
    prismaMock.user.create.mockImplementation(
      async ({ data }: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }) => {
        const user: User = {
          id: '8f86d5bb-ccf7-4985-9e42-549fa3eed8ac',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          ...data,
        };
        users.push(user);
        return user;
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user and never returns passwordHash', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ada Lovelace',
        email: 'Ada@Example.com',
        password: testPassword,
      })
      .expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: 'Ada@Example.com',
      name: 'Ada Lovelace',
    });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
    expect(users[0]?.normalizedEmail).toBe('ada@example.com');
    expect(users[0]?.passwordHash).not.toBe(testPassword);
  });

  it('rejects a duplicate normalized email', async () => {
    const payload = {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: testPassword,
    };

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...payload, email: 'ADA@EXAMPLE.COM' })
      .expect(409);
  });

  it('logs in with valid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: testPassword,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ADA@EXAMPLE.COM', password: testPassword })
      .expect(201);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user.email).toBe('ada@example.com');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('rejects an invalid password without revealing account existence', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: testPassword,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ada@example.com', password: 'WrongPassword!123' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or password.');
  });

  it('returns the authenticated user from /auth/me', async () => {
    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: testPassword,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${registration.body.accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: users[0]?.id,
      email: 'ada@example.com',
      name: 'Ada Lovelace',
    });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('rejects unauthenticated /auth/me requests', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
