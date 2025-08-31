import {ModulePurchaseRepository} from "../../../core/write/domain/repositories/ModulePurchaseRepository";
import {EntityManager} from "typeorm";
import {ModulePurchaseEntity} from "../entities/ModulePurchaseEntity";
import {ModulePurchase} from "../../../core/write/domain/aggregates/ModulePurchase";


export class PostgresModulePurchaseRepository implements ModulePurchaseRepository {


    constructor(
        private readonly _entityManager: EntityManager
    ) {
    }


    async create(modulePurchase: { userId: string; purchase: ModulePurchase }): Promise<void> {
        const {purchase, userId} = modulePurchase;
        const purchaseRepo = this._entityManager.getRepository(ModulePurchaseEntity);

        await purchaseRepo.save({
            id: purchase.id,
            userId,
            moduleId: purchase.props.moduleId,
            createdAt: purchase.props.createdAt,
            updatedAt: purchase.props.updatedAt
        });
    }
}