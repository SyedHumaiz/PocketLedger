import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthResponse, AuthenticatedUser } from './auth.types';

const passwordSaltRounds = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({
      where: { normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account already exists for this email.');
    }

    const passwordHash = await bcrypt.hash(dto.password, passwordSaltRounds);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          normalizedEmail,
          passwordHash,
        },
      });

      return this.createAuthResponse(user);
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('An account already exists for this email.');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({
      where: { normalizedEmail },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createAuthResponse(user);
  }

  async getCurrentUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    return this.toAuthenticatedUser(user);
  }

  private createAuthResponse(user: User): AuthResponse {
    return {
      accessToken: this.jwtService.sign({ sub: user.id, email: user.email }),
      user: this.toAuthenticatedUser(user),
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
