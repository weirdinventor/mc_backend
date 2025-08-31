import {UserRepository} from "../../../domain/repositories/UserRepository";
import {User} from "../../../domain/aggregates/User";
import {UserErrors} from "../../../domain/errors/UserErrors";
import {UserIdentity} from "../../../domain/entities/UserIdentity";

export class InMemoryUserRepository implements UserRepository {
    constructor(
        private readonly db: Map<string, User>
    ) {

    }

    isEmailExists(email: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async getById(id: string): Promise<User> {
        const user = this.db.get(id);
        if (!user) {
            throw new UserErrors.UserNotFound()
        }
        return user;
    }

    async getByEmail(email: string): Promise<User> {
        const values = Array.from(this.db.values());
        const user = values.find(user => user.props.email === email);
        if (!user) {
            throw new UserErrors.UserNotFound()
        }
        return user;
    }

    async save(user: User): Promise<void> {
        this.db.set(user.props.id, user)
    }

    changePassword(request: { user: UserIdentity; password: string }): Promise<void> {
        throw new Error("Method not implemented.");
    }

    blockUser(loggedUserId: string, userToBlockId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    isUserBlocked(loggedUserId: string, userToBlockId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    deleteAccount(user: UserIdentity): Promise<void> {
        throw new Error("Method not implemented.");
    }

    activateAccount(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}