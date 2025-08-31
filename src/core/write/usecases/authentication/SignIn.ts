import 'reflect-metadata';
import {Usecase} from "../../domain/models/Usecase";
import {User} from "../../domain/aggregates/User";
import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {PasswordGateway} from "../../domain/gateway/PasswordGateway";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {UserErrors} from "../../domain/errors/UserErrors";
import {
    PersonalInformationReadModelRepository
} from "../../../read/repositories/PersonalInformationReadModelRepository";
import {PersonalInformationReadModel} from "../../../read/models/PersonalInformationReadModel";

export interface UserSignInInput {
    email: string;
    password: string;
}

@injectable()
export class SignIn implements Usecase<UserSignInInput, PersonalInformationReadModel> {
    constructor(
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        @inject(Identifiers.personalInformationReadModelRepository)
        private readonly _personalInformationReadModelRepository: PersonalInformationReadModelRepository,
        @inject(Identifiers.passwordGateway)
        private readonly _passwordGateway: PasswordGateway,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: UserSignInInput): Promise<PersonalInformationReadModel> {
        const user = await this._userRepository.getByEmail(payload.email);
        if (!user) throw new UserErrors.UserNotFound();
        const passwordMatch = await this._passwordGateway.compare(payload.password, user.props.password);
        if (!passwordMatch) throw new UserErrors.PasswordInvalid();
        user.signIn();
        await this._userRepository.save(user);
        await this._eventDispatcher.dispatch(user);
        return await this._personalInformationReadModelRepository.getById(user.id);
    }
}