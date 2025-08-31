import {Container} from "inversify";
import {EntityManager} from "typeorm";
import {Identifiers} from "../../core/Identifiers";
import {PushNotificationGateway} from "../../core/write/domain/gateway/PushNotificationGateway";
import cron from "node-cron";
import {NotificationTypes} from "../../core/write/domain/types/NotificationTypes";

export async function fetchAndNotify1(container: Container) {
    const entityManager = container.get<EntityManager>(Identifiers.entityManager);
    const notificationGateway = container.get<PushNotificationGateway>(Identifiers.pushNotificationGateway)

    const result = await entityManager.query(`
        SELECT 
            live.*,
            json_build_object(
                  'id', d.id,
                  'registrationToken', d."registrationToken",
                  'uniqueId', d."uniqueId"
            ) AS device
        
        FROM live
                 INNER JOIN live_interested_users liu ON live.id = liu."liveId"
                 INNER JOIN devices d ON liu."usersId" = d.id
        
        WHERE live.status = 'scheduled'
        AND live."airsAt" >= NOW()
        AND live."airsAt" BETWEEN NOW() + INTERVAL '25 minutes' AND NOW() + INTERVAL '30 minutes'
    `);

    const tokens = result.map((r: any) => r.device.registrationToken);
    
    await notificationGateway.sendMulticast({
        data: {
            type: NotificationTypes.LIVE_STREAM_WILL_START,
            message: "The live stream will start in 30 minutes."
        },
        notification: {
            title: "Moula Club",
            body: "The live stream will start in 30 minutes."
        },
        registrationTokens: tokens
    })
}

export async function NotifyLiveWillStart30(container: Container) {
    const schedule = process.env.NOTIFY_WILL_START_30_MINUTES_SCHEDULE;
    if (!schedule || typeof schedule !== 'string' || !cron.validate(schedule)) {
        console.warn('Cron disabled: invalid or missing NOTIFY_WILL_START_30_MINUTES_SCHEDULE');
        return;
    }
    cron.schedule(schedule, async function () {
        await fetchAndNotify1(container);
    })
}