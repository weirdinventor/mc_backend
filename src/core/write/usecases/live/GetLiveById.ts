import { inject, injectable } from "inversify";
import { Usecase } from "../../domain/models/Usecase";
import { Live } from "../../domain/aggregates/Live";
import { Identifiers } from "../../../Identifiers";
import { LiveRepository } from "../../domain/repositories/LiveRepository";

@injectable()
export class GetLiveById implements Usecase<string, Live> {
  constructor(
    @inject(Identifiers.liveRepository)
    private readonly _liveRepository: LiveRepository
  ) {}

  execute(id: string): Promise<Live> {
    const live = this._liveRepository.getLiveById(id);
    return live;
  }
}
