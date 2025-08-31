import {inject, injectable} from "inversify";
import {DomainEventHandler} from "../../../adapters/services/DomainEventHandler";
import {ProfileCreated} from "../../../messages/events/ProfileCreated";
import {ActivateUser} from "../../../core/write/usecases/authentication/ActivateUser";

@injectable()
export class HandleProfileActivatedEvent implements DomainEventHandler<ProfileCreated> {
    constructor(
        @inject(ActivateUser)
        private readonly _activateUser: ActivateUser,
    ) {
    }

    async handle(domainEvent: ProfileCreated): Promise<void> {
        await this._activateUser.execute({userId: domainEvent.props.id})
    }
}
