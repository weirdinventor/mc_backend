import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Badge} from "../../domain/aggregates/Badge";
import {Identifiers} from "../../../Identifiers";
import {BadgeRepository} from "../../domain/repositories/BadgeRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {StorageGateway} from "../../domain/gateway/StorageGateway";

export interface CreateBadgeInput {
    name: string;
    description?: string;
    badgeType: 'Module_Expert_Contributor' | 'Special' | 'Achievement' | 'Skill' | 'Community';
    pictureUrl?: string;
}

@injectable()
export class CreateBadge implements Usecase<CreateBadgeInput, Badge> {
    constructor(
        @inject(Identifiers.badgeRepository)
        private readonly _badgeRepository: BadgeRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway)
        private readonly _storageGateway: StorageGateway
    ) {
    }

    async execute(payload: CreateBadgeInput):
        Promise<Badge> {
        payload.pictureUrl = await this._storageGateway.getDownloadUrl(payload.pictureUrl)
        const badge = Badge.createBadge(payload);
        const newBadge = await this._badgeRepository.save(badge);
        await this._eventDispatcher.dispatch(badge);
        return newBadge;
    }
}
