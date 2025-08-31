import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {PersonalInformationReadModel} from "../../models/PersonalInformationReadModel";
import {Identifiers} from "../../../Identifiers";
import {PersonalInformationReadModelRepository} from "../../repositories/PersonalInformationReadModelRepository";
import {UserIdentity} from "../../../write/domain/entities/UserIdentity";
import {UserRole} from "../../../write/domain/types/UserRole";
import {UserErrors} from "../../../write/domain/errors/UserErrors";


export interface GetAllUsersInput {
    user: UserIdentity
    subscribed?: boolean;
    take?: number;
    skip?: number;
}


@injectable()
export class GetAllUsers implements Query<GetAllUsersInput, {
    users: PersonalInformationReadModel[];
    total: number;
}> {

    constructor(
        @inject(Identifiers.personalInformationReadModelRepository)
        private readonly personalInformationReadModelRepository: PersonalInformationReadModelRepository
    ) {
    }


    async execute(payload: GetAllUsersInput): Promise<{
        users: PersonalInformationReadModel[];
        total: number;
    }> {
        const {user, subscribed, take, skip} = payload

        if (Number(user.role) !== UserRole.ADMIN && Number(user.role) !== UserRole.MODERATOR) {
            throw new UserErrors.PermissionDenied()
        }

        return await this.personalInformationReadModelRepository.getAllUsers({
            subscribed,
            take,
            skip
        });
    }
}