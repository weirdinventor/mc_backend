import {EntityManager, Like} from "typeorm";
import {Group} from "../../../core/write/domain/aggregates/Group";
import {GroupRepository} from "../../../core/write/domain/repositories/GroupRepository";
import {GroupEntityMapper} from "./mappers/GroupEntityMapper";
import {GroupEntity} from "../entities/GroupEntity";
import {UserEntityMapper} from "../user/mappers/UserEntityMapper";
import {UserEntity} from "../entities/UserEntity";
import {UpdateGroupInput} from "../../../core/write/usecases/group/UpdateGroup";
import {AddNewMemberInput} from "../../../core/write/usecases/group/AddNewMemeber";
import {SearchGroupInput} from "../../../core/write/usecases/group/SearchGroup";
import {GroupDto, GroupDtoProperties} from "../../../core/write/domain/dtos/GroupDto";
import {GroupMemberDto, GroupMemberDtoProperties} from "../../../core/write/domain/dtos/GroupMembersDto";
import {UserGroupRoleEntity} from "../entities/UserGroupRoleEntity";
import {MembershipsEntity} from "../entities/MembershipsEntity";
import {ResourceEntity} from "../entities/ResourceEntity";
import {AccessLevel} from "../../../core/write/domain/types/AccessLevel";

export class PostgresGroupRepository implements GroupRepository {
    private readonly groupEntityMapper: GroupEntityMapper;
    private readonly userEntityMapper: UserEntityMapper;

    constructor(private readonly entityManager: EntityManager) {
        this.groupEntityMapper = new GroupEntityMapper(this.entityManager);
        this.userEntityMapper = new UserEntityMapper(this.entityManager);
    }

    async getGroupOrModuleById(id: string): Promise<Group> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const group = await groupRepo.createQueryBuilder("group")
            .where("group.id = :id", {id})
            .leftJoinAndSelect("group.members", "members")
            .leftJoinAndSelect("group.roles", "roles")
            .leftJoinAndSelect("group.modulePurchase", "modulePurchase")
            .getOne();

        if (!group) return null

        return this.groupEntityMapper.toDomain(group);
    }

    async getGroupById(groupId: string, param: {
        isModule: boolean
    }): Promise<Group> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const group = await groupRepo.findOne({
            where: {
                id: groupId,
                isModule: param ? param.isModule : false,
            },
            relations: {
                members: true,
                roles: true,
                modulePurchase: true,
            }
        });

        if (!group) return null

        return this.groupEntityMapper.toDomain(group);
    }

    async getGroups(param?: {
        isModule: boolean;
        paid?: boolean;
    }): Promise<Group[]> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const whereCondition: any = {
            isModule: param.isModule || false,
        };

        // If a paid parameter is provided, and it's false, filter only free modules
        if (param.isModule && param.paid !== undefined && !param.paid) {
            whereCondition.accessLevel = AccessLevel.FREE;
        }

        const groups = await groupRepo.find({
            where: whereCondition,
            relations: {
                members: true,
                roles: true,
                modulePurchase: true,
            },
            order: {
                name: "ASC"
            }
        });

        return groups.map(group => this.groupEntityMapper.toDomain(group));
    }

    async searchGroup(param: SearchGroupInput): Promise<GroupDtoProperties[]> {
        const {query, take, skip} = param;
        const groupRepo = this.entityManager.getRepository(GroupEntity);

        const [result, total] = await groupRepo.findAndCount({
            where: {
                name: Like(`%${query}%`),
            },
            relations: {
                members: true
            },
            take,
            skip
        })


        const groups = result.map(group => {
            const element = new GroupDto(group);
            return element.group;
        })

        return groups;
    }

    async getUserOwnedGroups(userId: string): Promise<GroupDtoProperties[]> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);

        const result = await groupRepo.find({
            where: {
                ownerId: userId,
            },
            relations: {
                members: true,
                roles: true,
                modulePurchase: true,
            },
        });

        const groups = result.map(group => {
            const element = new GroupDto(group);
            return element.group;
        })

        return groups;
    }

    async getUserJoinedGroups(userId: string): Promise<GroupDtoProperties[]> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);

        const joinedGroups = await groupRepo
            .createQueryBuilder("group")
            .innerJoinAndSelect("group.members", "members")
            .getMany();

        const userJoinedGroups = joinedGroups.filter(group => {
            return group.members.some(member => member.groupId === userId);
        });

        const groups = userJoinedGroups.map(group => {
            const element = new GroupDto(group);
            return element.group;
        })

        return groups;
    }

    async getGroupMembers(groupId: string): Promise<GroupMemberDtoProperties[]> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const group = await groupRepo.find({
            where: {
                id: groupId,
            },
            relations: {
                members: true,
                roles: true,
                userGroupRoles: true,
                modulePurchase: true
            },
        });


        return new GroupMemberDto(group[0]).groupMembers
    }

    async createGroup(group: Group): Promise<Group> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const userRepo = this.entityManager.getRepository(UserEntity);
        const membershipsRepo = this.entityManager.getRepository(MembershipsEntity);
        const groupEntity = this.groupEntityMapper.fromDomain(group);

        const user = await userRepo.findOne({
            where: {
                id: group.props.ownerId,
            },
        });

        if (!user) {
            return null
        }

        const savedGroup = await groupRepo.save(groupEntity);

        await membershipsRepo.save({
            userId: user.id,
            groupId: savedGroup.id,
            isAdmin: true,
        });

        const groupWithDefaultMember = await groupRepo.findOne({
            where: {
                id: savedGroup.id,
            },
            relations: {
                members: true,
                roles: true,
                modulePurchase: true
            }
        });

        return this.groupEntityMapper.toDomain(groupWithDefaultMember);
    }

    async updateGroup(group: UpdateGroupInput): Promise<Group> {
        const {id, name, subject, coverImage, thumbnail, permissions, voiceRoomId} = group.data;
        const groupRepo = this.entityManager.getRepository(GroupEntity);

        const groupToUpdate = await groupRepo.findOne({
            where: {
                id,
                isModule: group.isModule ? group.isModule : false,
            },
            relations: {
                members: true,
                roles: true,
                modulePurchase: true
            },
        });


        if (!groupToUpdate) return null;

        groupToUpdate.name = name;
        groupToUpdate.subject = subject;
        groupToUpdate.coverImage = coverImage;
        groupToUpdate.thumbnail = thumbnail;
        groupToUpdate.permissions = permissions;
        groupToUpdate.voiceRoomId = voiceRoomId;

        const updatedGroup = await groupRepo.save(groupToUpdate);

        return this.groupEntityMapper.toDomain(updatedGroup);
    }

    async addNewMember(param: AddNewMemberInput): Promise<Group> {
        const {groupId, userId} = param.data;
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const userRepo = this.entityManager.getRepository(UserEntity);
        const membershipsRepo = this.entityManager.getRepository(MembershipsEntity);

        await membershipsRepo.save({
            userId,
            groupId,
            isAdmin: false,
        });

        const groupWithMembers = await groupRepo.findOne({
            where: {
                id: groupId,
            },
            relations: {
                members: true,
                roles: true,
                modulePurchase: true
            },
        });

        return this.groupEntityMapper.toDomain(groupWithMembers);
    }

    async deleteGroup(param: { groupId: string; isModule?: boolean }): Promise<void> {
        const {isModule, groupId} = param
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const groupRoleRepo = this.entityManager.getRepository(UserGroupRoleEntity);
        const membershipRepo = this.entityManager.getRepository(MembershipsEntity);
        const resourceRepo = this.entityManager.getRepository(ResourceEntity);

        await groupRoleRepo.query(`
            DELETE
            FROM user_group_role
            WHERE "groupId" = $1
        `, [groupId])

        await membershipRepo.delete({
            groupId
        })

        await resourceRepo.delete({
            groupId
        })

        await groupRepo.query(`
            DELETE
            FROM "group"
            WHERE id = $1
            AND "isModule" = $2
        `, [groupId, isModule ?? false])
    }

    async isUserMemberOfGroup(payload: { userId: string; groupId: string }): Promise<boolean> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const {userId, groupId} = payload;

        const group = await groupRepo.findOne({
            where: {
                id: groupId,
            },
            relations: {
                members: true,
                roles: true,
                modulePurchase: true
            }
        });

        return group.members.some(member => member.userId === userId);
    }

    async isUserPurchasedModule(payload: { userId: string; moduleId: string }): Promise<boolean> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const {userId, moduleId} = payload;

        const group = await groupRepo.findOne({
            where: {
                id: moduleId,
            },
            relations: {
                modulePurchase: true
            }
        });

        return group.modulePurchase.some(purchase => purchase.userId === userId);
    }
}
