import {UserRole} from "../types/UserRole";

export interface UserIdentity {
    id: string;
    phone?: string;
    email: string;
    role: UserRole
    isSubscribed?: boolean;
}
