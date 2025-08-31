
import {Signup} from "../../core/write/usecases/authentication/Signup";
import {Identifiers} from "../../core/Identifiers";
import {UserRepository} from "../../core/write/domain/repositories/UserRepository";
import {UserRole} from "../../core/write/domain/types/UserRole";
import {AccountStatus} from "../../core/write/domain/types/AccountStatus";
import {AppDependencies} from "../../app/config/AppDependencies";


const main = async (container: AppDependencies) => {

    const signupAction = container.get<Signup>(Signup);
    const userRepo = container.get<UserRepository>(Identifiers.userRepository);

    // admin user
    const admin = await signupAction.execute({
        email: 'admin@moula.app',
        password: 'moula'
    });
    // moderator
    const moderator = await signupAction.execute({
        email: 'moderator@moula.app',
        password: 'moula'
    });
    // customer
    const customer = await signupAction.execute({
        email: 'customer@moula.app',
        password: 'moula'
    });

    admin.props.role = UserRole.ADMIN
    admin.props.status = AccountStatus.ACTIVE
    await userRepo.save(admin)

    moderator.props.role = UserRole.MODERATOR
    moderator.props.status = AccountStatus.ACTIVE
    await userRepo.save(moderator)

    customer.props.role = UserRole.USER
    customer.props.status = AccountStatus.ACTIVE
    await userRepo.save(customer)
}

export default main;