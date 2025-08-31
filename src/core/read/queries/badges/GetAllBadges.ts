import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {EntityManager} from "typeorm";
import {BadgeEntity} from "../../../../adapters/repositories/entities/BadgeEntity";

export interface BadgeDto {
    id: string;
    name: string;
    description?: string;
    badgeType: string;
    pictureUrl?: string;
}

@injectable()
export class GetAllBadges {
    constructor(
        @inject(Identifiers.entityManager)
        private readonly _entityManager: EntityManager
    ) {}

    async execute(): Promise<BadgeDto[]> {
        // Get all badges from the repository
        const repository = this._entityManager.getRepository(BadgeEntity);
        const badgeEntities = await repository.find();
        
        // Map entities to DTOs
        return badgeEntities.map(entity => ({
            id: entity.id,
            name: entity.name,
            description: entity.description,
            badgeType: entity.badgeType,
            pictureUrl: entity.pictureUrl
        }));
    }
}