import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Live} from "../../domain/aggregates/Live";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";

export type Timeframe = "future" | "ongoing"

@injectable()
export class GetLivesByTimeframe implements Usecase<Timeframe, Live[]> {

    constructor(
        @inject(Identifiers.liveRepository) private readonly _liveRepository: LiveRepository
    ) {
    }

    async execute(timeframe: Timeframe): Promise<Live[]> {
        return await this._liveRepository.getLivesByTimeframe(timeframe);
    }
}