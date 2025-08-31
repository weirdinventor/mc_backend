import {inject, injectable} from "inversify";
import {UserRepository} from "../../domain/repositories/UserRepository";
import "reflect-metadata"
import {Identifiers} from "../../../Identifiers";
import {Usecase} from "../../domain/models/Usecase";
import {User} from "../../domain/aggregates/User";
import {GoogleAuthentication} from "../../domain/gateway/GoogleAuthentication";
import {UserErrors} from "../../domain/errors/UserErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";

export interface SignInGoogleUserInput {
    token: string
}

@injectable()
export class SignInGoogleUser implements Usecase<SignInGoogleUserInput, User> {
    constructor(
        @inject(Identifiers.userRepository)
        private _userRepository: UserRepository,
        @inject(Identifiers.googleAuthGateway)
        private _googleAuthenticationGateway: GoogleAuthentication,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(request: SignInGoogleUserInput): Promise<User> {

        const tokenPayload = await this._googleAuthenticationGateway.verify(request.token);

        let user = await this._userRepository.getByEmail(tokenPayload.email);

        if(!user) {
            throw new UserErrors.UserNotFound();
        }
        user.signIn()
        await this._userRepository.save(user)
        await this.eventDispatcher.dispatch(user)
        return user;
    }

}
