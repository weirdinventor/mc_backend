import "reflect-metadata";

import {Credentials, OAuth2Client, TokenPayload, UserRefreshClient,} from "google-auth-library";
import {injectable} from "inversify";
import {GoogleAuthentication} from "../../../core/write/domain/gateway/GoogleAuthentication";

@injectable()
export class GoogleAuthenticationGateway implements GoogleAuthentication {
  constructor(
    private readonly _oauthClientHandle: OAuth2Client,
    private readonly _oauthClientVerify: OAuth2Client,
    private readonly _clientId: string,
    private readonly _clientSecret: string
  ) {}
  async refeshToken(refreshToken: string): Promise<Credentials> {
    const user = new UserRefreshClient(
      this._clientId,
      this._clientSecret,
      refreshToken
    );
    const { credentials } = await user.refreshAccessToken();
    return credentials;
  }

  async handleCode(code: string): Promise<Credentials> {
   
    const { tokens } = await this._oauthClientHandle.getToken(code);
    return tokens;
  }

  async verify(token: string): Promise<TokenPayload> {
    console.log({
      idToken: token,
      audience: this._clientId,
    })
    const ticket = await this._oauthClientVerify.verifyIdToken({
      idToken: token,
      audience: this._clientId,
    });

    return ticket.getPayload();
  }
}
