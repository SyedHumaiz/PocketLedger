import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GroupRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { NotificationsService } from '../notifications/notifications.service';

const safeMember = { user: { select: { id:true, name:true, email:true } }, role:true, joinedAt:true } as const;
@Injectable()
export class GroupsService {
  constructor(private readonly prisma:PrismaService,private readonly notifications:NotificationsService) {}
  async create(userId:string,dto:CreateGroupDto){return this.prisma.expenseGroup.create({data:{name:dto.name,createdById:userId,members:{create:{userId,role:GroupRole.OWNER}}},include:{_count:{select:{members:true}}}});}
  async findAll(userId:string){return this.prisma.expenseGroup.findMany({where:{members:{some:{userId}}},orderBy:{updatedAt:'desc'},select:{id:true,name:true,createdById:true,createdAt:true,updatedAt:true,_count:{select:{members:true}}}});}
  async findOne(userId:string,id:string){await this.requireMembership(userId,id);const group=await this.prisma.expenseGroup.findUnique({where:{id},select:{id:true,name:true,createdById:true,createdAt:true,updatedAt:true,members:{select:safeMember,orderBy:{joinedAt:'asc'}}}});if(!group)throw new NotFoundException('Group not found.');return group;}
  async addMember(actorId:string,groupId:string,dto:AddGroupMemberDto){await this.requireOwner(actorId,groupId);const user=await this.prisma.user.findUnique({where:{normalizedEmail:dto.email},select:{id:true,name:true,email:true}});if(!user)throw new NotFoundException('User not found.');const existing=await this.prisma.groupMember.findUnique({where:{groupId_userId:{groupId,userId:user.id}}});if(existing)throw new ConflictException('User is already a group member.');try{const member=await this.prisma.groupMember.create({data:{groupId,userId:user.id,role:GroupRole.MEMBER},select:safeMember});await this.notifications.notifySafely(user.id,'Group update','You were added to a group.',`group-member-added:${groupId}:${user.id}`);return member;}catch(error:unknown){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('User is already a group member.');throw error;}}
  async removeMember(actorId:string,groupId:string,userId:string){const owner=await this.requireOwner(actorId,groupId);if(owner.userId===userId)throw new ForbiddenException('The group owner cannot be removed.');const member=await this.prisma.groupMember.findUnique({where:{groupId_userId:{groupId,userId}}});if(!member)throw new NotFoundException('Group member not found.');await this.prisma.groupMember.delete({where:{groupId_userId:{groupId,userId}}});return {removed:true};}
  private async requireMembership(userId:string,groupId:string){const member=await this.prisma.groupMember.findUnique({where:{groupId_userId:{groupId,userId}}});if(!member)throw new NotFoundException('Group not found.');return member;}
  private async requireOwner(userId:string,groupId:string){const member=await this.requireMembership(userId,groupId);if(member.role!==GroupRole.OWNER)throw new ForbiddenException('Only a group owner can manage members.');return member;}
}
