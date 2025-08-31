import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./UserEntity";
import { GroupEntity } from "./GroupEntity";
import { RoleEntity } from "./RoleEntity";

@Entity("user_group_role")
@Index(["userId", "groupId", "roleId"], { unique: true })
export class UserGroupRoleEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    nullable: false,
    type: "varchar",
  })
  userId: string;

  @Column({
    nullable: false,
    type: "varchar",
  })
  groupId: string;

  @Column({
    nullable: false,
    type: "varchar",
  })
  roleId: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToOne(() => UserEntity, (user) => user.userGroupRoles)
  user: UserEntity;

  @ManyToOne(() => GroupEntity, (group) => group.userGroupRoles)
  group: GroupEntity;

  @ManyToOne(() => RoleEntity, (role) => role.userGroupRoles)
  role: RoleEntity;
}
