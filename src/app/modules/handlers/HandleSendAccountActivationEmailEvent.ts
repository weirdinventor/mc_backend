
import {inject, injectable} from "inversify";
import {DomainEventHandler} from "../../../adapters/services/DomainEventHandler";
import {SendAccountActivationEmailEvent} from "../../../messages/events/SendAccountActivationEmailEvent";
import {SendAccountActivationEmail} from "../../../core/write/usecases/notification/SendAccountActivationEmail";
import {isHexColor} from "class-validator";

@injectable()
export class HandleSendAccountActivationEmailEvent implements DomainEventHandler<SendAccountActivationEmailEvent> {
    constructor(
        @inject(SendAccountActivationEmail)
        private readonly _sendAccountActivationEmail: SendAccountActivationEmail,
    ) {
    }

    async handle(domainEvent: SendAccountActivationEmailEvent): Promise<void> {
        await this._sendAccountActivationEmail.execute({
            email: domainEvent.props.email,
            url: domainEvent.props.url
        })
    }
}
