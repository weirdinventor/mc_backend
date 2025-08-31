import {RecipientEntityMapper} from "./mappers/RecipientEntityMapper";
import {EntityManager} from "typeorm";
import {Recipient} from "../../../core/write/domain/aggregates/Recipient";
import {RecipientRepository} from "../../../core/write/domain/repositories/RecipientRepository";
import {RecipientEntity} from "../entities/RecipientEntity";
import {RecipientErrors} from "../../../core/write/domain/errors/RecipientErrors";



export class PostgresRecipientRepository implements RecipientRepository {

  private _recipientRepositoryMapper : RecipientEntityMapper

  constructor(
    private readonly _entityManager : EntityManager
  ) {
    this._recipientRepositoryMapper = new RecipientEntityMapper(_entityManager)
  }

  async save(recipient: Recipient): Promise<Recipient> {
    const recipientRepository = this._entityManager.getRepository(RecipientEntity);
    const recipientEntity = this._recipientRepositoryMapper.fromDomain(recipient);
    await recipientRepository.save(recipientEntity)
    return recipient
  }

  async getById(id: string): Promise<Recipient> {
    const recipientRepository = this._entityManager.getRepository(RecipientEntity);
    const recipientEntity = await recipientRepository.findOne({where: {id}});
    if (!recipientEntity) {
      throw new RecipientErrors.RecipientNotFound();
    }
    return this._recipientRepositoryMapper.toDomain(recipientEntity);
  }
}
