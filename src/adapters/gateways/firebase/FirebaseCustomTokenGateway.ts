import {injectable} from "inversify";
import {CustomTokenGateway} from "../../../core/write/domain/gateway/CustomTokenGateway";
import {UserIdentity} from "../../../core/write/domain/entities/UserIdentity";
import admin from "firebase-admin";


@injectable()
export class FirebaseCustomTokenGateway implements CustomTokenGateway {

    constructor(
        private readonly _firebaseConfig: admin.app.App
    ) {
    }

    async encode(uid: string, identity: UserIdentity): Promise<string> {
        const token = await this._firebaseConfig.auth().createCustomToken(uid, {
            ...identity
        });

        return token;
    }
}