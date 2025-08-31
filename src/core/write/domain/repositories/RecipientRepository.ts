import {Recipient} from "../aggregates/Recipient";

export interface RecipientRepository {
  save(recipient: Recipient): Promise<Recipient>;
  getById(id: string): Promise<Recipient>
}
