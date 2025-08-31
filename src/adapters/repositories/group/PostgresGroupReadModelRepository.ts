import {inject, injectable} from "inversify";
import {GroupReadModelRepository} from "../../../core/read/repositories/GroupReadModelRepository";
import {GroupMembersReadModel} from "../../../core/read/models/GroupMembersReadModel";
import {GroupMembersReadModelMapper} from "../modelMappers/GroupMembersReadModelMapper";
import {EntityManager} from "typeorm";


@injectable()
export class PostgresGroupReadModelRepository implements GroupReadModelRepository {

    private _groupMembersReadModelMapper: GroupMembersReadModelMapper;

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._groupMembersReadModelMapper = new GroupMembersReadModelMapper();
    }

    async getGroupMembers(groupId: string): Promise<GroupMembersReadModel[]> {
        const result = await this._entityManager
            .createQueryBuilder('users', "u")
            .select([
                'u.id',
                'u.status',
                'u.role',
                'u.isSubscribed',
                'u.email',
                'u.createdAt',
                'u.updatedAt',
                'p.username',
                'p.firstName',
                'p.lastName',
                'p.gender',
                'p.profilePicture',
                'g.id AS groupId',
                'g.ownerId',
                'r.id AS groupRoleId',
                'r.name AS groupRoleName',
                'r.permissions AS groupRolePermissions',
            ])
            .leftJoin('profiles', 'p', 'u.id = p.id')
            .innerJoin('membership', 'm', 'u.id = m.userId')
            .innerJoin('group', 'g', 'g.id = m.groupId')
            .leftJoin('user_group_role', 'ugr', 'u.id = ugr.userId AND g.id = ugr.groupId')
            .leftJoin('role', 'r', 'ugr.roleId = r.id')
            .where('g.id = :groupId', {groupId})
            .orderBy('u.id = g.ownerId', 'DESC')
            .addOrderBy('u.createdAt', 'ASC')
            .getRawMany();


        return result.map((raw: any) => this._groupMembersReadModelMapper.toDomain(raw));
    }
}