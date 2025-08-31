import {EmailGateway, EmailNotification} from "../../../core/write/domain/gateway/EmailGateway";
import {injectable} from "inversify";
import {SendgridConfig, sendgridConfig} from "../../../app/config/config";

@injectable()
export class SendgridEmailGateway implements EmailGateway {

    constructor(
        private readonly sendgridConfig: SendgridConfig,
    ) {
    }

    async send(payload: EmailNotification): Promise<void> {

        const msg = {
            to: payload.to,
            from: sendgridConfig.from,
            templateId: payload.templateId,
            payload: payload.data
        }
        const result = await this.sendgridConfig.sgMail.send({
            to: msg.to,
            from: msg.from,
            templateId: msg.templateId,
            dynamicTemplateData: msg.payload
        })
    }
}