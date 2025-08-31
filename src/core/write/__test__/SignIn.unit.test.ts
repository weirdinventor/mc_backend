import {PasswordGateway} from "../domain/gateway/PasswordGateway";
import {UserRepository} from "../domain/repositories/UserRepository";
import {SignIn} from "../usecases/authentication/SignIn";
import {InMemoryUserRepository} from "./adapters/repositories/InMemoryUserRepository";
import {User} from "../domain/aggregates/User";
import {MockPasswordGateway} from "./adapters/gateways/MockPasswordGateway";
import {eventDispatcherMock} from "./adapters/gateways/EventDispatcherMock";
import {AuthMode} from "../domain/types/AuthMode";
import {PersonalInformationReadModelRepository} from "../../read/repositories/PersonalInformationReadModelRepository";

describe('Unit - SignIn', () => {
    let signIn: SignIn;
    let userRepository: UserRepository;
    let passwordGateway: PasswordGateway;
    let personalInformationReadModelRepository: PersonalInformationReadModelRepository;
    const dbUser = new Map<string, User>();
    let user: User;

    beforeAll(async () => {
        userRepository = new InMemoryUserRepository(dbUser);
        passwordGateway = new MockPasswordGateway()
        signIn = new SignIn(userRepository, personalInformationReadModelRepository, passwordGateway, eventDispatcherMock());
        user = User.signup({
            email: "riadh.feddini@yopmail.com", password: "azertyu", authMode: AuthMode.EMAIL
        })
        await userRepository.save(user);
    });

    it('should signIn a user ', async () => {
        const user = await signIn.execute({
            email: "riadh.feddini@yopmail.com",
            password: "azertyu"
        })
        expect(user.email).toBe("riadh.feddini@yopmail.com")
    })

    it("should throw an error if the user doesn't exist", async () => {
        const user = signIn.execute({
            email: "feddini@yopmail.com",
            password: "azertyu"
        })
        await expect(user).rejects.toThrow()
    })

    it("should throw an error if it's the wrong password", async () => {
        const user = signIn.execute({
            email: "riadh.feddini@yopmail.com",
            password: "xxxxxxxx"
        })
        await expect(user).rejects.toThrow()
    })
})