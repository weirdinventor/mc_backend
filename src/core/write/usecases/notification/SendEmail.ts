import {inject, injectable} from "inversify";
import {RecipientRepository} from "../../domain/repositories/RecipientRepository";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {EmailGateway} from "../../domain/gateway/EmailGateway";

export interface NotifyUserRequest {
  templateId: string;
  data: Record<string, string>;
  userId : string;
}

@injectable()
export class SendEmail implements Usecase<NotifyUserRequest, void> {
  constructor(
    @inject(Identifiers.emailGateway)
    private readonly _emailNotificationGateway: EmailGateway,
    @inject(Identifiers.recipientRepository)
    private readonly _recipientRepository : RecipientRepository
  ) {
  }

  async execute(request: NotifyUserRequest): Promise<void> {
    const recipient = await this._recipientRepository.getById(request.userId)
    return await this._emailNotificationGateway.send({
      templateId : request.templateId,
      data : request.data,
      to : recipient.props.email
    });
  }
}
