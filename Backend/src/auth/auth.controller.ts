import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthResponse, AuthenticatedUser, JwtPayload } from './auth.types';

type AuthenticatedRequest = ExpressRequest & { user: JwtPayload };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() request: AuthenticatedRequest): Promise<AuthenticatedUser> {
    return this.authService.getCurrentUser(request.user.sub);
  }
}
