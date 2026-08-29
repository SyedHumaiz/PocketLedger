import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupsService } from './groups.service';
type AuthenticatedRequest = ExpressRequest & { user: JwtPayload };

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}
  @Post() create(@Request() request: AuthenticatedRequest,@Body() dto:CreateGroupDto){return this.groupsService.create(request.user.sub,dto);}
  @Get() findAll(@Request() request: AuthenticatedRequest){return this.groupsService.findAll(request.user.sub);}
  @Get(':id') findOne(@Request() request: AuthenticatedRequest,@Param('id',new ParseUUIDPipe()) id:string){return this.groupsService.findOne(request.user.sub,id);}
  @Post(':id/members') addMember(@Request() request: AuthenticatedRequest,@Param('id',new ParseUUIDPipe()) id:string,@Body() dto:AddGroupMemberDto){return this.groupsService.addMember(request.user.sub,id,dto);}
  @Delete(':id/members/:userId') removeMember(@Request() request: AuthenticatedRequest,@Param('id',new ParseUUIDPipe()) id:string,@Param('userId',new ParseUUIDPipe()) userId:string){return this.groupsService.removeMember(request.user.sub,id,userId);}
}
