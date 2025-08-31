import {v4} from "uuid";
import {AggregateRoot} from "../entities/AggregateRoot";
import {GroupPermission} from "../types/GroupPermissions";
import {GroupCreated} from "../../../../messages/events/group/GroupCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {GroupUpdated} from "../../../../messages/events/group/GroupUpdated";
import {Role} from "./Role";
import {MemberAdded} from "../../../../messages/events/group/MemberAdded";
import {GroupDeleted} from "../../../../messages/events/group/GroupDeleted";
import {MembershipsEntity} from "../../../../adapters/repositories/entities/MembershipsEntity";
import {VoiceRoomCreated} from "../../../../messages/events/group/VoiceRoomCreated";
import {AccessLevel} from "../types/AccessLevel";

export interface GroupProperties {
    id: string;
    coverImage?: string;
    thumbnail?: string;
    name: string;
    subject: string;
    permissions?: GroupPermission[];
    ownerId: string;
    members: MembershipsEntity[];
    roles: Role[];
    voiceRoomId?: string;
    isModule?: boolean;
    accessLevel?: AccessLevel;
    owned?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Group extends AggregateRoot<GroupProperties> {
    static restore(props: GroupProperties) {
        return new Group(props);
    }

    static createGroup(payload: {
        coverImage?: string;
        thumbnail?: string;
        name: string;
        subject: string;
        permissions?: GroupPermission[];
        ownerId: string;
        accessLevel?: AccessLevel;
        isModule: boolean;
    }) {
        const {
            coverImage,
            thumbnail,
            name,
            subject,
            permissions,
            ownerId,
            isModule,
            accessLevel,
        } = payload;
        const group = new Group({
            id: v4(),
            coverImage,
            thumbnail,
            name,
            subject,
            permissions: permissions || [
                GroupPermission.SEND_MESSAGES,
                GroupPermission.SEND_MEDIA,
            ],
            accessLevel,
            isModule,
            members: [],
            roles: [],
            ownerId,
        });

        group.applyChange(
            new GroupCreated({
                id: group.props.id,
                coverImage: coverImage,
                thumbnail: thumbnail,
                name: name,
                subject: subject,
                permissions: permissions,
                ownerId: ownerId,
                accessLevel,
                isModule
            })
        );

        return group;
    }

    @Handle(GroupCreated)
    private applyGroupCreated(event: GroupCreated) {
        this.props.id = event.props.id;
        this.props.coverImage = event.props.coverImage;
        this.props.thumbnail = event.props.thumbnail;
        this.props.name = event.props.name;
        this.props.subject = event.props.subject;
        this.props.permissions = event.props.permissions;
        this.props.ownerId = event.props.ownerId;
    }

    updateGroup(payload: {
        id: string;
        name: string;
        subject: string;
        coverImage?: string;
        thumbnail?: string;
        voiceRoomId?: string;
        permissions?: GroupPermission[];
        accessLevel?: AccessLevel;
    }) {
        const {id, name, subject, coverImage, thumbnail, permissions, voiceRoomId, accessLevel} = payload;

        this.applyChange(
            new GroupUpdated({
                id: id,
                coverImage: coverImage,
                thumbnail: thumbnail,
                name: name,
                subject: subject,
                permissions: permissions,
                voiceRoomId,
                accessLevel
            })
        );

        return this;
    }

    @Handle(GroupUpdated)
    private applyGroupUpdated(event: GroupUpdated) {
        this.props.id = event.props.id;
        this.props.coverImage = event.props.coverImage;
        this.props.name = event.props.name;
        this.props.subject = event.props.subject;
        this.props.permissions = event.props.permissions;
        this.props.accessLevel = event.props.accessLevel;
    }

    addMember(payload: { groupId: string; userId: string }) {
        const {groupId, userId} = payload;

        this.applyChange(
            new MemberAdded({
                groupId: groupId,
                userId: userId,
            })
        );

        return this;
    }

    @Handle(MemberAdded)
    private applyMemberAdded(event: MemberAdded) {
        this.props.id = event.props.groupId;
    }

    deleteGroup(groupId: string) {

        this.applyChange(
            new GroupDeleted({
                id: groupId,
            })
        );

        return this;
    }

    @Handle(GroupDeleted)
    private applyGroupDeleted(event: GroupDeleted) {
        this.props.id = event.props.id;
    }

    createVoiceRoom(payload: { id: string }) {

        this.applyChange(
            new VoiceRoomCreated(payload)
        )

        return this;
    }

    @Handle(VoiceRoomCreated)
    private applyVoiceRoomCreated(event: VoiceRoomCreated) {
        this.props.id = event.props.id;
    }
}
