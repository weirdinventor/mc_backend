import {UpdateLiveInput} from "../../usecases/live/UpdateLive";
import {Live} from "../aggregates/Live";
import {Timeframe} from "../../usecases/live/GetLivesByTimeframe";
import {GetLivesByStatusAndDateInput} from "../../usecases/live/GetLivesByStatusAndDate";
import {AddUserInterestToLiveInput} from "../../usecases/live/AddUserInterestToLive";
import {RemoveUserInterestFromLiveInput} from "../../usecases/live/RemoveUserInterestFromLive";
import {Record} from "../aggregates/Record";

export interface LiveRepository {
    getAll(): Promise<Live[]>;

    getLiveById(id: string): Promise<Live>;

    getLiveByRoomId(roomId: string): Promise<Live>;

    getLiveByGroupId(groupId: string): Promise<Live>;

    getLiveRecord(liveId: string): Promise<Record>;

    save(live: Live): Promise<Live>;

    update(live: UpdateLiveInput): Promise<Live>;

    delete(id: string): Promise<void>;

    cancel(id: string): Promise<Live>;

    publish(id: string): Promise<Live>;

    getLivesByTimeframe(timeframe: Timeframe): Promise<Live[]>;

    getLivesByStatusAndDate(payload: GetLivesByStatusAndDateInput): Promise<Live[]>;

    markAsOngoing(id: string): Promise<Live>;

    addUserInterestToLive(payload: AddUserInterestToLiveInput): Promise<void>

    removeUserInterestFromLive(payload: RemoveUserInterestFromLiveInput): Promise<void>

    getInterestedUsersIds(liveId: string): Promise<string[]>;

    saveRecord(payload: {
        roomId: string,
        record: Record
    }): Promise<Record>

    getLivesByGroupOrModuleId(id: string): Promise<Live[]>;
}
