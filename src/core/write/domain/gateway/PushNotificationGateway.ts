import {
    PushMulticastMessagePayload,
    PushMulticastNotificationPayload,
    PushNotificationPayload
} from "../types/NotificationTypes";


export interface PushNotificationGateway {
    send(payload: PushNotificationPayload): Promise<void>;

    sendMulticast(payload: PushMulticastNotificationPayload): Promise<void>

    sendMessageMulticast(payload: PushMulticastMessagePayload): Promise<void>
}
