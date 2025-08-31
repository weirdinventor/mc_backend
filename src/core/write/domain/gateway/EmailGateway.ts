export type EmailNotification = {
    to: string | string[];
    templateId: string;
    data: Record<string, string>;
}

export interface EmailGateway {
    send(payload : EmailNotification) : Promise<void>
}