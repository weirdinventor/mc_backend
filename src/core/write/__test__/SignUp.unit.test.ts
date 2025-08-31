import {Signup} from "../usecases/authentication/Signup";
import {UserRepository} from "../domain/repositories/UserRepository";
import {InMemoryUserRepository} from "./adapters/repositories/InMemoryUserRepository";
import {User} from "../domain/aggregates/User";
import {PasswordGateway} from "../domain/gateway/PasswordGateway";
import {eventDispatcherMock} from "./adapters/gateways/EventDispatcherMock";
import {MockPasswordGateway} from "./adapters/gateways/MockPasswordGateway";
import {UserErrors} from "../domain/errors/UserErrors";

describe('Unit - SignUp', () => {
    let signup: Signup;
    let userRepository : UserRepository;
    let passwordGateway: PasswordGateway;

    beforeAll( async () => {
        userRepository = new InMemoryUserRepository(new Map<string, User>());
        passwordGateway = new MockPasswordGateway();
        signup = new Signup(userRepository, passwordGateway, eventDispatcherMock());
    });

    it("should signup a user", async () => {
        const user = await signup.execute({
            email: "farouk@gmail.com",
            password: "azerty"
        })
        expect(user.props.email).toEqual("farouk@gmail.com")
    });

    it("should throw an error if the email is already used", async () => {
        const user = await signup.execute({
            email: "farouk@gmail.com",
            password: "azerty"
        })
        const user2 = signup.execute({
            email: "farouk@gmail.com",
            password: "azerty"
        })

        await expect(user2).rejects.toThrow(UserErrors.EmailAlreadyUsed)
    });
});