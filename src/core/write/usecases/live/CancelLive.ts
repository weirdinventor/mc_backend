import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {Live} from "../../domain/aggregates/Live";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {LiveErrors} from "../../domain/errors/LiveErrors";

@injectable()
export class CancelLive implements Usecase<string, Live> {
    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(id: string): Promise<Live> {
        const live = await this._liveRepository.getLiveById(id);

        if (!live) throw new LiveErrors.LiveNotFound();

        live.cancelLive({
            id
        })

        const newLive = await this._liveRepository.cancel(id);
        await this.eventDispatcher.dispatch(live);
        return newLive;
    }
}
