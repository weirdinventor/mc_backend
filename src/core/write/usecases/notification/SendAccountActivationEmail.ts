import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {inject, injectable} from "inversify";
import {EmailGateway} from "../../domain/gateway/EmailGateway";
export interface SendAccountActivationEmailProperties {
    email: string,
    url : string
}

@injectable()
export class SendAccountActivationEmail implements Usecase<SendAccountActivationEmailProperties, void>{
    constructor(
        @inject(Identifiers.emailGateway)
        private readonly _emailGateway: EmailGateway
    ) {
    }
    async execute(request: SendAccountActivationEmailProperties): Promise<void> {
        //TODO implement email activation usecase
        await this._emailGateway.send({
            data: undefined, templateId: "", to: undefined
        })
    }
}