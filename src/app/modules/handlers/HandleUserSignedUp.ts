import {inject, injectable} from "inversify";
import {EventDispatcher} from "../../../adapters/services/EventDispatcher";
import {DomainEventHandler} from "../../../adapters/services/DomainEventHandler";
import {UserSignedUp} from "../../../messages/events/UserSignedUp";
import {Identifiers} from "../../../core/Identifiers";
import {EmailGateway} from "../../../core/write/domain/gateway/EmailGateway";
import {UserRepository} from "../../../core/write/domain/repositories/UserRepository";
import {SaveRecipient} from "../../../core/write/usecases/notification/SaveRecipient";
import {sign} from "jsonwebtoken";
import {SendAccountActivationEmailEvent} from "../../../messages/events/SendAccountActivationEmailEvent";
import {AuthMode} from "../../../core/write/domain/types/AuthMode";
import {ActivateUser} from "../../../core/write/usecases/authentication/ActivateUser";

@injectable()
export class HandleUserSignedUp implements DomainEventHandler<UserSignedUp> {
    constructor(
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        @inject(Identifiers.emailGateway)
        private readonly _emailGateway: EmailGateway,
        @inject(SaveRecipient)
        private readonly _saveRecipient : SaveRecipient,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher,
        @inject(ActivateUser)
        private readonly _activateUser: ActivateUser

    ) {
    }

    async handle(domainEvent: UserSignedUp): Promise<void> {
        const recipient = await this._saveRecipient.execute({
            id : domainEvent.metadata.aggregateId,
            email : domainEvent.props.email,
            phone : null
        })
        await this._activateUser.execute({userId: domainEvent.metadata.aggregateId})
        //TODO: Implement the logic to send account activation email
        /*if(domainEvent.props.authMode === AuthMode.EMAIL) {
            const encryptedId = sign({
                id: domainEvent.metadata.aggregateId
            }, process.env.JWT_SECRET, {expiresIn: '30min'})
            const url = `${process.env.BACKEND_URL}/api/common/${encryptedId}`
            await this._eventDispatcher.dispatchEvent(new SendAccountActivationEmailEvent({
                email: recipient.props.email,
                url
            }))
        }else if (domainEvent.props.authMode === AuthMode.APPLE || domainEvent.props.authMode === AuthMode.GOOGLE) {
            await this._activateUser.execute({userId: domainEvent.metadata.aggregateId})
        }*/
    }
}
