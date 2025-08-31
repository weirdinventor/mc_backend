import {PostMediaType} from "../../write/domain/types/PostMediaType";
import {AccountStatus} from "../../write/domain/types/AccountStatus";
import {UserRole} from "../../write/domain/types/UserRole";


export interface AuthorReadModel {
    id: string;
    username: string;
    email: string;
    phone: string;
    profilePicture: string;
    signInAt: Date;
    status: AccountStatus
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReactionReadModel {
    id: string;
    emoji: string;
    userId:string;
}

export interface GetPostsReadModel {
    id: string;
    text: string;
    mediaUrl: string;
    mediaType: PostMediaType;
    thumbnail?: string;
    authorId: string;
    author: AuthorReadModel;
    liveCategoryId?: string;
    createdAt: Date;
    updatedAt: Date;
    reactions?: ReactionReadModel[];
}
