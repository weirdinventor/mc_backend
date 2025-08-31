import verifyAppleToken from 'verify-apple-id-token';
import {injectable} from "inversify";
import {AppleGateway} from "../../../core/write/domain/gateway/AppleGateway";

export interface AppleAuthConfig {
    clientID: string;
    teamID: string;
    privateKey: string;
    keyIdentifier: string;
    redirectUri: string;
    expAfter?: number;
}

@injectable()
export class AppleAuthGateway implements AppleGateway{
    private config: AppleAuthConfig;

    constructor(config: AppleAuthConfig) {
        this.config = config;
    }

    async verify(token: string): Promise<string> {
        const jwtClaims = await verifyAppleToken({
            idToken: token,
            clientId : this.config.clientID,
        });
        return jwtClaims.email;
    }
}
