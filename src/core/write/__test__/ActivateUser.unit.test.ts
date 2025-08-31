import { ActivateUser } from "../usecases/authentication/ActivateUser";
import { UserRepository } from "../domain/repositories/UserRepository";
import { InMemoryUserRepository } from "./adapters/repositories/InMemoryUserRepository";
import { User } from "../domain/aggregates/User";
import { eventDispatcherMock } from "./adapters/gateways/EventDispatcherMock";
import { v4 } from "uuid";
import { UserRole } from "../domain/types/UserRole";
import { AccountStatus } from "../domain/types/AccountStatus";

describe("Unit - ActivateUser", () => {
  let activateUser: ActivateUser;
  let userRepository: UserRepository;
  let user: User;

  beforeAll(async () => {
    userRepository = new InMemoryUserRepository(new Map<string, User>());
    activateUser = new ActivateUser(userRepository, eventDispatcherMock());
    user = new User({
      id: v4(),
      email: "riadh.feddini@gmail.com",
      password: "azerty",
      signInAt: new Date(),
      status: AccountStatus.INACTIVE,
        role: UserRole.USER,
      blockedUsers: []
    });
    await userRepository.save(user);
  });

  it("Should activate a user", async () => {
    await activateUser.execute({ userId: user.props.id });
    const activatedUser = await userRepository.getById(user.props.id);
    expect(activatedUser.props.status).toEqual(AccountStatus.ACTIVE);
  });
});
