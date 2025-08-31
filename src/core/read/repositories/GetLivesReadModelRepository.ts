import {LiveReadModel} from "../models/LiveReadModel";
import {GetLivesByTimeframeInput} from "../queries/lives/GetLivesByTimeframe";


export interface LivesReadModelRepository {
    getLives(): Promise<LiveReadModel[]>;

    getLivesByTimeframe(payload: GetLivesByTimeframeInput,isModule?: boolean): Promise<LiveReadModel[]>;
}