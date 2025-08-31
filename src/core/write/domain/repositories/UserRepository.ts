import {User} from "../aggregates/User";
import {UserIdentity} from "../entities/UserIdentity";

export interface UserRepository {
    getByEmail(email: string): Promise<User>

    save(user: User): Promise<void>;

    getById(id: string): Promise<User>

    isEmailExists(email: string): Promise<boolean>;

    changePassword(request: {
        user: UserIdentity,
        password: string
    }): Promise<void>;

    blockUser(loggedUserId: string, userToBlockId: string): Promise<void>

    isUserBlocked(loggedUserId: string, userToBlockId: string): Promise<boolean>

    deleteAccount(user: UserIdentity): Promise<void>;

    activateAccount(id: string): Promise<void>;
}