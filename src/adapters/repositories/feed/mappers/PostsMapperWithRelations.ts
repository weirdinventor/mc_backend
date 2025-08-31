import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {PostEntity} from "../../entities/PostEntity";
import {Post} from "../../../../core/write/domain/aggregates/Post";
import {PostEntityMapper} from "./PostEntityMapper";
import {UserEntityMapper} from "../../user/mappers/UserEntityMapper";
import {EntityManager} from "typeorm";

export class PostsMapperWithRelations implements Mapper<PostEntity, Post> {
    private readonly postMapper: PostEntityMapper;
    private readonly userMapper: UserEntityMapper;

    constructor(private readonly entityManager: EntityManager) {
        this.postMapper = new PostEntityMapper(this.entityManager)
        this.userMapper = new UserEntityMapper(this.entityManager)
    }

    toDomain(raw: PostEntity): Post {
        if (!raw) return null;

        delete raw.author.password

        return new Post({
            ...raw,
            author: {
                ...raw.author,
            }
        })
    }
}