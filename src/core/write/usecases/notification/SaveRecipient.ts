import {inject, injectable} from "inversify";
import {Recipient} from "../../domain/aggregates/Recipient";
import {Identifiers} from "../../../Identifiers";
import {Usecase} from "../../domain/models/Usecase";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {RecipientRepository} from "../../domain/repositories/RecipientRepository";

export interface SaveRecipientInput {
  id: string;
  email: string;
  phone: string;
}

@injectable()
export class SaveRecipient implements Usecase<SaveRecipientInput, Recipient> {

  constructor(
    @inject(Identifiers.recipientRepository)
    private readonly recipientRepository: RecipientRepository,
    @inject(EventDispatcher)
    private readonly eventDispatcher: EventDispatcher
  ) {
  }

  async execute(request: SaveRecipientInput): Promise<Recipient> {
    const { id, phone, email } = request;
    const recipient = Recipient.create({
      email,
      phone,
      id,
    })
    await this.recipientRepository.save(recipient);
    await this.eventDispatcher.dispatch(recipient);
    return recipient;
  }
}
