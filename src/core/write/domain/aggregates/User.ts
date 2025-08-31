import {UserRole} from "../types/UserRole";
import {AggregateRoot} from "../entities/AggregateRoot";
import {v4} from "uuid";
import {UserSignedUp} from "../../../../messages/events/UserSignedUp";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {Email} from "../valueObject/Email";
import {UserSignIn} from "../../../../messages/events/UserSignIn";
import {AccountStatus} from "../types/AccountStatus";
import {UserAccountActivated} from "../../../../messages/events/UserAccountActivated";
import {AuthMode} from "../types/AuthMode";
import {Post, PostProperties} from "./Post";
import {PasswordChanged} from "../../../../messages/events/PasswordChanged";
import {RecoveryCodeGenerated} from "../../../../messages/events/RecoveryCodeGenerated";
import {PasswordReset} from "../../../../messages/events/PasswordReset";
import {UserErrors} from "../errors/UserErrors";
import {AccountDeleted} from "../../../../messages/events/AccountDeleted";
import {UserBlocked} from "../../../../messages/events/UserBlocked";

export interface UserProperties {
    id: string;
    email: string;
    password: string;
    signInAt: Date;
    phone?: string;
    status: AccountStatus;
    role: UserRole;
    authMode?: AuthMode;
    posts?: PostProperties[];
    recoveryCode?: string;
    isSubscribed?: boolean;
    blockedUsers: string[];
    currentGradeId?: string;
    lastActivityTimestamp?: Date;
    lastDailyRewardTimestamp?: Date;
    experiencePoints?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export class User extends AggregateRoot<UserProperties> {
    static restore(props: UserProperties) {
        return new User(props);
    }

    static signup(payload: { email: string; password: string, authMode: AuthMode }) {
        const {email, password, authMode} = payload;
        const user = new User({
            id: v4(),
            email,
            password,
            signInAt: new Date(),
            status: AccountStatus.INACTIVE,
            role: UserRole.USER,
            isSubscribed: false, // Users must subscribe after onboarding
            authMode,
            blockedUsers: [],
        });
        console.log(`User Signed Up`, email)
        user.applyChange(
            new UserSignedUp({
                id: user.props.id,
                email: new Email(email).value,
                authMode,
                role: UserRole.USER,
            })
        );
        return user;
    }

    @Handle(UserSignedUp)
    private applyUserSignedUp(event: UserSignedUp) {
        this.props.email = event.props.email;
        this.props.authMode = event.props.authMode;
        this.props.role = event.props.role;
    }

    signIn() {
        this.applyChange(
            new UserSignIn({
                signInAt: new Date(),
            })
        );
        return this;
    }

    @Handle(UserSignIn)
    private applyUserSignIn(event: UserSignIn) {
        this.props.signInAt = event.props.signInAt;
    }

    activate() {
        this.applyChange(
            new UserAccountActivated({
                accountStatus: AccountStatus.ACTIVE,
            })
        );
        return this;
    }

    @Handle(UserAccountActivated)
    private applyUserAccountActivated(event: UserAccountActivated) {
        this.props.status = event.props.accountStatus;
    }

    generateRecoveryCode(code: string) {
        this.applyChange(
            new RecoveryCodeGenerated({
                email: this.props.email,
                recoveryCode: code,
                id: this.id
            })
        )
    }

    @Handle(RecoveryCodeGenerated)
    private applyRecoveryCodeGenerated(event: RecoveryCodeGenerated) {
        this.props.recoveryCode = event.props.recoveryCode;
    }

    resetPassword(payload: {
        password: string;
        recoveryCode: string;
    }) {
        if (this.props.recoveryCode !== payload.recoveryCode) {
            throw new UserErrors.InvalidRecoveryCode();
        }
        this.applyChange(
            new PasswordReset({
                password: payload.password,
            })
        )
    }

    @Handle(PasswordReset)
    private applyPasswordReset(event: PasswordReset) {
        this.props.password = event.props.password;
        this.props.recoveryCode = null;
    }


    changePassword(payload: {
        previousPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) {
        this.applyChange(
            new PasswordChanged(payload)
        )
    }

    @Handle(PasswordChanged)
    private applyPasswordChanged(event: PasswordChanged) {
        this.props.password = event.props.newPassword;
    }

    blockUser(payload: {
        userId: string;
        userToBlockId: string
    }) {

        this.applyChange(
            new UserBlocked({
                userId: payload.userId,
                blockedUserId: payload.userToBlockId
            })
        )
    }

    @Handle(UserBlocked)
    private applyUserBlocked(event: UserBlocked) {
        this.props.blockedUsers.push(event.props.blockedUserId)
    }

    updateSubscriptionStatus(isSubscribed: boolean) {
        this.props.isSubscribed = isSubscribed
    }

    deleteAccount(payload: {
        id: string;
        phone?: string;
        email: string;
        role: UserRole
        isSubscribed?: boolean;
    }) {
        this.applyChange(
            new AccountDeleted({
                user: payload
            })
        )
    }

    @Handle(AccountDeleted)
    private applyAccountDeleted(event: AccountDeleted) {
        this.props.deletedAt = new Date();
    }
}
