import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {GetUserByIdReadModel} from "../../models/GetUserByIdReadModel";
import {GetUserByIdReadModelRepository} from "../../repositories/GetUserByIdReadModelRepository";
import {Identifiers} from "../../../Identifiers";


export interface GetUserByIdInput {
    id: string;
}

@injectable()
export class GetUserById implements Query<GetUserByIdInput, GetUserByIdReadModel> {

    constructor(
        @inject(Identifiers.getUserByIdReadModelRepository)
        private readonly getUserByIdReadModelRepository: GetUserByIdReadModelRepository
    ) {
    }

    async execute(request: GetUserByIdInput): Promise<GetUserByIdReadModel> {
        return await this.getUserByIdReadModelRepository.getById(request.id);
    }

}