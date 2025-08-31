import {PersonalInformationReadModel} from "../../models/PersonalInformationReadModel";
import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {PersonalInformationReadModelRepository} from "../../repositories/PersonalInformationReadModelRepository";
import {Query} from "../../../write/domain/models/Query";
import {UserErrors} from "../../../write/domain/errors/UserErrors";

export interface GetPersonalInformationInput {
    id: string;
}

@injectable()
export class GetPersonalInformation implements Query<GetPersonalInformationInput, PersonalInformationReadModel> {
    constructor(@inject(Identifiers.personalInformationReadModelRepository)
                private readonly personalInformationReadModelRepository: PersonalInformationReadModelRepository) {
    }

    async execute(input: GetPersonalInformationInput): Promise<PersonalInformationReadModel> {
        const user = await this.personalInformationReadModelRepository.getById(input.id);

        if (!user) {
            throw new UserErrors.ThisAccountIsDeleted();
        }

        return user;
    }
}