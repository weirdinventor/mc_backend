import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {Usecase} from "../../domain/models/Usecase";
import {ProfileRepository} from "../../domain/repositories/ProfileRepository";
import {UserRepository} from "../../domain/repositories/UserRepository";

export interface GetProfileByEmailRequest {
    username: string;
}

@injectable()
export class IsEmailTaken implements Usecase<GetProfileByEmailRequest, boolean> {
    constructor(
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository
    ) {
    }
    async execute(request: GetProfileByEmailRequest): Promise<boolean> {
        return await this._userRepository.isEmailExists(request.username);
    }
}
