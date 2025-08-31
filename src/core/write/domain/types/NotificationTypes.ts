export enum NotificationTypes {
    NEW_MESSAGE = 'NewMessage',
    LIVE_STREAM_WILL_START = 'LiveStreamWillStart',
    LIVE_STREAM_STARTED = 'LiveStreamStarted',
}

export interface PushNotificationPayload {
    notification: { title: string; body: string };
    data: Record<string, string>;
    registrationToken: string;
}

export interface PushMulticastNotificationPayload {
    notification: { title: string; body: string };
    data: Record<string, string>;
    registrationTokens: string[];
}

export interface PushMulticastMessagePayload {
    data: Record<string, string>;
    registrationTokens: string[];
}