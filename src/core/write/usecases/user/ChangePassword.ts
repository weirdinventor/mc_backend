import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {PasswordGateway} from "../../domain/gateway/PasswordGateway";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {UserErrors} from "../../domain/errors/UserErrors";


export interface ChangePasswordInput {
    user: UserIdentity
    passwordPayload: {
        previousPassword: string;
        newPassword: string;
        confirmPassword: string;
    }
}


@injectable()
export class ChangePassword implements Usecase<ChangePasswordInput, void> {
    constructor(
        @inject(Identifiers.userRepository)
        private readonly userRepository: UserRepository,
        @inject(Identifiers.passwordGateway)
        private readonly _passwordGateway: PasswordGateway,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(request: ChangePasswordInput): Promise<void> {
        const {passwordPayload, user} = request
        const userData = await this.userRepository.getById(user.id)
        if (!userData) throw new UserErrors.UserNotFound()

        if (passwordPayload.newPassword !== passwordPayload.confirmPassword) throw new UserErrors.PasswordNotMatch();

        const passwordMatch = await this._passwordGateway.compare(passwordPayload.previousPassword, userData.props.password);
        if (!passwordMatch) throw new UserErrors.PasswordInvalid();

        const newPassword = await this._passwordGateway.encrypt(passwordPayload.newPassword);

        userData.changePassword({
            previousPassword: userData.props.password,
            newPassword: newPassword,
            confirmPassword: newPassword,
        });

        await this.userRepository.changePassword({
            user,
            password: newPassword
        })

        await this._eventDispatcher.dispatch(userData)
    }
}