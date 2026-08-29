import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { GroupSettlementsService } from './group-settlements.service';
type AuthenticatedRequest=ExpressRequest & {user:JwtPayload};
@Controller('groups/:groupId') @UseGuards(JwtAuthGuard)
export class GroupSettlementsController {constructor(private readonly service:GroupSettlementsService){} @Post('settlements') create(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string,@Body() dto:CreateSettlementDto){return this.service.create(r.user.sub,groupId,dto);} @Get('settlements') findAll(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string){return this.service.findAll(r.user.sub,groupId);} @Delete('settlements/:settlementId') remove(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string,@Param('settlementId',new ParseUUIDPipe()) settlementId:string){return this.service.remove(r.user.sub,groupId,settlementId);} @Get('settlement-suggestions') suggestions(@Request() r:AuthenticatedRequest,@Param('groupId',new ParseUUIDPipe()) groupId:string){return this.service.suggestions(r.user.sub,groupId);}}
