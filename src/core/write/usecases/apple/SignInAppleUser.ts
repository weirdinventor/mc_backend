import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {Usecase} from "../../domain/models/Usecase";
import { AppleGateway } from "../../domain/gateway/AppleGateway";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {User} from "../../domain/aggregates/User";
import {UserErrors} from "../../domain/errors/UserErrors";
import {v4} from "uuid";
import {AuthMode} from "../../domain/types/AuthMode";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";

export interface AuthenticateAppleUserInput {
    token: string
}

@injectable()
export class SignInAppleUser implements Usecase<AuthenticateAppleUserInput, User> {
    constructor(
        @inject(Identifiers.appleAuthGateway)
        private readonly _appleAuthGateway: AppleGateway,
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(request: AuthenticateAppleUserInput): Promise<User> {
        const email = await this._appleAuthGateway.verify(request.token);
        const user = await this._userRepository.getByEmail(email);
        if(!user) {
            throw new UserErrors.UserNotFound();
        }
        user.signIn()
        await this._userRepository.save(user)
        await this._eventDispatcher.dispatch(user)
        return user;
    }
}
