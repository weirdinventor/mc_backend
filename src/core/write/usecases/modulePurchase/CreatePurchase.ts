import {inject, injectable} from "inversify";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {Usecase} from "../../domain/models/Usecase";
import {Group} from "../../domain/aggregates/Group";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {ModulePurchase} from "../../domain/aggregates/ModulePurchase";
import {ModulePurchaseRepository} from "../../domain/repositories/ModulePurchaseRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";


export interface CreatePurchaseInput {
    user: UserIdentity;
    moduleId: string;
}

@injectable()
export class CreatePurchase implements Usecase<CreatePurchaseInput, Group> {

    constructor(
        @inject(Identifiers.modulePurchaseRepository) private readonly _modulePurchaseRepository: ModulePurchaseRepository,
        @inject(Identifiers.groupRepository) private readonly _groupRepository: GroupRepository,
        @inject(EventDispatcher) private readonly eventDispatcher: EventDispatcher
    ) {
    }


    async execute(payload: CreatePurchaseInput): Promise<Group> {
        const {moduleId} = payload;
        const module = await this._groupRepository.getGroupById(moduleId, {
            isModule: true,
        });

        if (!module) {
            throw new GroupErrors.GroupNotFound("MODULE_NOT_FOUND");
        }

        if (module.props.ownerId === payload.user.id) {
            throw new GroupErrors.UserIsOwner();
        }

        const purchased = await this._groupRepository.isUserPurchasedModule({
            userId: payload.user.id,
            moduleId
        })

        if (purchased) {
            throw new GroupErrors.AlreadyPurchased();
        }

        const purchase = ModulePurchase.createModulePurchase({
            userId: payload.user.id,
            moduleId
        })

        await this._modulePurchaseRepository.create({
            purchase,
            userId: payload.user.id
        });

        await this._groupRepository.addNewMember({
            user: payload.user,
            data: {
                groupId: moduleId,
                userId: payload.user.id
            }
        });

        await this.eventDispatcher.dispatch(purchase)

        return module;
    }
}