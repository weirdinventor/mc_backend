import {Credentials, TokenPayload} from "google-auth-library";

export interface GoogleAuthentication{
    verify(token): Promise<TokenPayload>
    handleCode(code): Promise<Credentials>
    refeshToken(props): Promise<Credentials>
}