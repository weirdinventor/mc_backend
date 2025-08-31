import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {CustomTokenGateway} from "../../domain/gateway/CustomTokenGateway";
import {UserRole} from "../../domain/types/UserRole";
import {v4} from "uuid";


export interface GenerateFirebaseTokenInput {
    id: string;
    email: string;
    role: UserRole
}

@injectable()
export class GenerateFirebaseToken implements Usecase<GenerateFirebaseTokenInput, string> {

    constructor(
        @inject(Identifiers.customTokenGateway)
        private readonly _customTokenGateway: CustomTokenGateway
    ) {
    }

    async execute(payload: GenerateFirebaseTokenInput): Promise<string> {
        const {id, email, role} = payload
        return await this._customTokenGateway.encode(v4(), {email, id, role})
    }
}