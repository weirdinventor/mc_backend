import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Live} from "../../domain/aggregates/Live";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";

@injectable()
export class GetLives implements Usecase<void, Live[]> {
    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository
    ) {
    }

    async execute(): Promise<Live[]> {
        const lives = await this._liveRepository.getAll();
        return lives;
    }
}
