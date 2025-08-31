import {inject, injectable} from "inversify";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";


export interface ActivateAccountInput {
    user: UserIdentity;
    id: string;
}

@injectable()
export class ActivateAccount implements Usecase<ActivateAccountInput, void> {

    constructor(
        @inject(Identifiers.userRepository)
        private readonly userRepository: UserRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: ActivateAccountInput): Promise<void> {
        const {id, user} = payload;

        if (Number(user.role) !== UserRole.ADMIN) {
            throw new UserErrors.PermissionDenied();
        }

        const userToActivate = await this.userRepository.getById(id);

        if (!userToActivate) {
            throw new UserErrors.UserNotFound();
        }

        userToActivate.activate()
        await this.userRepository.activateAccount(id);
        await this.eventDispatcher.dispatch(userToActivate);
    }

}
