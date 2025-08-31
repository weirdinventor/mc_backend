import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {Identifiers} from "../../../Identifiers";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";


@injectable()
export class DeleteAccount implements Usecase<UserIdentity, void> {

    constructor(
        @inject(Identifiers.userRepository) private readonly _userRepository: UserRepository,
        @inject(EventDispatcher) private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: UserIdentity): Promise<void> {
        const user = await this._userRepository.getById(payload.id);
        user.deleteAccount(payload);
        await this._userRepository.deleteAccount(payload);
        await this._eventDispatcher.dispatch(user);
    }
}