import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {Usecase} from "../../domain/models/Usecase";
import {AppleGateway} from "../../domain/gateway/AppleGateway";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {User} from "../../domain/aggregates/User";
import {UserErrors} from "../../domain/errors/UserErrors";
import {AuthMode} from "../../domain/types/AuthMode";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {v4} from "uuid";
import {PasswordGateway} from "../../domain/gateway/PasswordGateway";

export interface AuthenticateAppleUserInput {
    token: string
}

@injectable()
export class SignUpAppleUser implements Usecase<AuthenticateAppleUserInput, User> {
    constructor(
        @inject(Identifiers.appleAuthGateway)
        private readonly _appleAuthGateway: AppleGateway,
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher,
        @inject(Identifiers.passwordGateway)
        private readonly _passwordGateway: PasswordGateway
    ) {
    }

    async execute(request: AuthenticateAppleUserInput): Promise<User> {
        const email = await this._appleAuthGateway.verify(request.token);
         let user = await this._userRepository.getByEmail(email);
        if(user) {
            throw new UserErrors.EmailAlreadyUsed();
        }

        user = User.signup({
            authMode: AuthMode.APPLE,
            email,
            password : await this._passwordGateway.encrypt(v4()),
        })
        await this._userRepository.save(user)
        await this._eventDispatcher.dispatch(user)
        return user;
    }
}
