import 'reflect-metadata';
import {Usecase} from "../../domain/models/Usecase";
import {inject, injectable} from "inversify";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {Identifiers} from "../../../Identifiers";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";

export class ActivateUserProperties {
   userId : string;
}
@injectable()
export class ActivateUser implements Usecase<ActivateUserProperties, void> {
    constructor(
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(request?: ActivateUserProperties): Promise<void> {
        const user = await this._userRepository.getById(request.userId);
        user.activate();
        await this._userRepository.save(user);
        await this.eventDispatcher.dispatch(user);
    }
}