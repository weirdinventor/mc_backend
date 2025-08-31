import 'reflect-metadata';
import {injectable} from 'inversify';
import admin from 'firebase-admin';
import {
    PushNotificationGateway
} from "../../../core/write/domain/gateway/PushNotificationGateway";
import {
    PushMulticastMessagePayload,
    PushMulticastNotificationPayload,
    PushNotificationPayload
} from "../../../core/write/domain/types/NotificationTypes";



@injectable()
export class FirebasePushNotificationGateway implements PushNotificationGateway {
    constructor(
        private readonly _firebaseConfig: admin.app.App
    ) {
    }

    async send(payload: PushNotificationPayload) {
        await this._firebaseConfig.messaging().send({
            token: payload.registrationToken,
            data: payload.data,
            notification: payload.notification
        });
    }

    async sendMulticast(payload: PushMulticastNotificationPayload): Promise<void> {
        await this._firebaseConfig.messaging().sendEachForMulticast({
            tokens: payload.registrationTokens,
            ...(payload.data && {
                data: payload.data
            }),
            ...(payload.notification && {
                notification: payload.notification,
            })
        });
    }

    async sendMessageMulticast(payload: PushMulticastMessagePayload): Promise<void> {
        await this._firebaseConfig.messaging().sendEachForMulticast({
            tokens: payload.registrationTokens,
            ...(payload.data && {
                data: payload.data
            }),
        });
    }
}

