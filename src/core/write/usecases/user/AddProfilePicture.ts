import {ProfileRepository} from "../../domain/repositories/ProfileRepository";
import {Identifiers} from "../../../Identifiers";
import {inject, injectable} from "inversify";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {Usecase} from "../../domain/models/Usecase";
import {Profile} from "../../domain/aggregates/Profile";
import {StorageGateway} from "../../domain/gateway/StorageGateway";

export interface AddProfilePictureInput {
    userId: string;
    filePath : string;
}

@injectable()
export class AddProfilePicture implements Usecase<AddProfilePictureInput, Profile>{
    constructor(
        @inject(Identifiers.profileRepository)
        private readonly profileRepository: ProfileRepository,
        @inject(Identifiers.storageGateway)
        private readonly storageGateway: StorageGateway,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(input: AddProfilePictureInput): Promise<Profile> {
        const profile = await this.profileRepository.getById(input.userId);
        const url = await this.storageGateway.getDownloadUrl(input.filePath);
        profile.addProfilePicture({url});
        await this.profileRepository.save(profile);
        await this.eventDispatcher.dispatch(profile);
        return profile
    }
}