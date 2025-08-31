import {UserIdentity} from "../entities/UserIdentity";

export interface CustomTokenGateway {
    encode(uid: string, identity: UserIdentity): Promise<string>;
}