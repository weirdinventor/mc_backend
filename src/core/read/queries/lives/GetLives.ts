import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {LiveReadModel} from "../../models/LiveReadModel";
import {Identifiers} from "../../../Identifiers";
import {LivesReadModelRepository} from "../../repositories/GetLivesReadModelRepository";


@injectable()
export class GetLives implements Query<void, LiveReadModel[]> {

    constructor(
        @inject(Identifiers.livesReadModelRepository)
        private readonly getLivesReadModelRepository: LivesReadModelRepository
    ) {
    }

    async execute(): Promise<LiveReadModel[]> {
        return await this.getLivesReadModelRepository.getLives();
    }
}