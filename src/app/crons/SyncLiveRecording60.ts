import {Container} from "inversify";
import {EntityManager} from "typeorm";
import {Identifiers} from "../../core/Identifiers";
import {VideosSdkGateway} from "../../adapters/gateways/videoSdk/VideosSdkgateway";
import cron from "node-cron";
import {v4} from "uuid";
import {RecordStatus} from "../../core/write/domain/types/RecordStatus";

export async function fetchAndSetFileUrl(container: Container) {

    const entityManager = container.get<EntityManager>(Identifiers.entityManager);
    const videoSdkGateway = container.get<VideosSdkGateway>(Identifiers.streamingGateway);

    const lives = await entityManager.query(`
        SELECT * 
        FROM live
        WHERE live."recordId" IS NULL
    `);

    for (let i = 0; i < lives.length; i++) {
        const {id, roomId} = lives[i];

        const result = await videoSdkGateway.getRecording({
            roomId,
            userId: v4()
        });

        if (result) {
            const UUID = v4();

            const createdRecord = await entityManager.query(`
                 INSERT INTO record (id, "fileUrl", "createdAt", "updatedAt", title, description, thumbnail, status)
                 VALUES ($1, $2, NOW(), NOW(), NULL, NULL, NULL, $3);
             `, [UUID, result.fileUrl, RecordStatus.DRAFT]);

            console.log("CREATED RECORD", createdRecord);

            await entityManager.query(`
                 UPDATE live
                 SET "recordId" = $1
                 WHERE id = $2
             `, [UUID, id]);
        }
    }
}


export async function SyncLiveRecording60(container: Container) {
    const schedule = process.env.SYNC_LIVE_RECORDING_60_MINUTES_SCHEDULE;
    if (!schedule || typeof schedule !== 'string' || !cron.validate(schedule)) {
        console.warn('Cron disabled: invalid or missing SYNC_LIVE_RECORDING_60_MINUTES_SCHEDULE');
        return;
    }
    cron.schedule(schedule, async () => {
        await fetchAndSetFileUrl(container)
    });
}