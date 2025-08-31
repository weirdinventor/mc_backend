import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Profile} from "../../domain/aggregates/Profile";
import {Identifiers} from "../../../Identifiers";
import {ProfileRepository} from "../../domain/repositories/ProfileRepository";
import {ProfileErrors} from "../../domain/errors/ProfileErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";

export interface UpdateUsernameInput {
    id: string;
    username: string;
}


@injectable()
export class UpdateUsername implements Usecase<UpdateUsernameInput, Profile> {

    constructor(
        @inject(Identifiers.profileRepository)
        private readonly _profileRepository: ProfileRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }


    async execute(request: UpdateUsernameInput): Promise<Profile> {
        const isUsernameExists = await this._profileRepository.isUsernameExists(request.username)
        if (isUsernameExists) {
            throw new ProfileErrors.UsernameAlreadyUsed()
        }
        const profile = await this._profileRepository.getById(request.id)
        profile.updateUsername({username: request.username})
        const updatedProfile = await this._profileRepository.updateUsername(request)
        await this.eventDispatcher.dispatch(profile);
        return updatedProfile;
    }
}