import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {Live} from "../../domain/aggregates/Live";
import {Identifiers} from "../../../Identifiers";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {LiveErrors} from "../../domain/errors/LiveErrors";
import {LiveStatus} from "../../domain/types/LiveStatus";
import {FirebasePushNotificationGateway} from "../../../../adapters/gateways/firebase/FirebasePushNotificationGateway";
import {NotificationTypes} from "../../domain/types/NotificationTypes";
import {PushNotificationGateway} from "../../domain/gateway/PushNotificationGateway";
import {DeviceRepository} from "../../domain/repositories/DeviceRepository";


export interface MarkAsOngoingInput {
    id: string;
}

@injectable()
export class MarkAsOngoing implements Usecase<MarkAsOngoingInput, Live> {

    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher,
        @inject(Identifiers.pushNotificationGateway)
        private readonly _pushNotificationGateway: PushNotificationGateway,
        @inject(Identifiers.deviceRepository)
        private readonly _deviceRepository: DeviceRepository
    ) {
    }


    async execute(request: MarkAsOngoingInput): Promise<Live> {
        const live = await this._liveRepository.getLiveById(request.id);

        if (!live) throw new LiveErrors.LiveNotFound();
        if (live.props.status === LiveStatus.ONGOING)
            throw new LiveErrors.LiveAlreadyOngoing();

        if (live.props.status !== LiveStatus.SCHEDULED)
            throw new LiveErrors.LiveNotScheduled();

        live.markLiveAsOngoing({
            id: request.id
        })

        const interestedUsersIds = await this._liveRepository.getInterestedUsersIds(request.id);
        
        if (interestedUsersIds.length > 0) {
            const tokens = await this._deviceRepository.getRegistrationTokens(interestedUsersIds);
            if (tokens.length) {
                await this._pushNotificationGateway.sendMulticast({
                    data: {
                        type: NotificationTypes.LIVE_STREAM_STARTED,
                        message: `The ${live.props.title} live stream has started.`
                    },
                    notification: {
                        title: "Moula Club",
                        body: `The ${live.props.title} live stream has started.`
                    },
                    registrationTokens: tokens
                })
            }
        }

        const ongoingLive = await this._liveRepository.markAsOngoing(request.id);
        await this.eventDispatcher.dispatch(live);
        return ongoingLive
    }

}