import {RecipientRepository} from "../../../domain/repositories/RecipientRepository";
import {Recipient} from "../../../domain/aggregates/Recipient";
import {RecipientErrors} from "../../../domain/errors/RecipientErrors";

export class InMemoryRecipientRepository implements RecipientRepository {
  constructor(
    private readonly db: Map<string, Recipient>
  ) {}

  async save(recipient: Recipient): Promise<Recipient> {
    this.db.set(recipient.id, recipient);
    return recipient
  }

  async getById(id: string): Promise<Recipient> {
    const recipient = this.db.get(id);
    if (!recipient) {
      throw new RecipientErrors.RecipientNotFound();
    }
    return this.db.get(id);
  }
}
