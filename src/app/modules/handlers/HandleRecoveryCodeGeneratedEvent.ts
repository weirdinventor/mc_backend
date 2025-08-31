import {inject, injectable} from "inversify";
import {DomainEventHandler} from "../../../adapters/services/DomainEventHandler";
import {RecoveryCodeGenerated} from "../../../messages/events/RecoveryCodeGenerated";
import {SendEmail} from "../../../core/write/usecases/notification/SendEmail";

@injectable()
export class HandleRecoveryCodeGeneratedEvent implements DomainEventHandler<RecoveryCodeGenerated> {
    constructor(
       @inject(SendEmail)
        private readonly _sendEmail: SendEmail,

    ) {

    }

    async handle(domainEvent: RecoveryCodeGenerated): Promise<void> {
        await this._sendEmail.execute({
            templateId: "d-f2ccb9493ada413eae3f0801467813d9",
            data: {
                data: domainEvent.props.recoveryCode
            },
            userId: domainEvent.props.id
        })
    }
}

