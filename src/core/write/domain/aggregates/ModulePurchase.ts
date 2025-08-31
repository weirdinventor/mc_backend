import {AggregateRoot} from "../entities/AggregateRoot";
import {v4} from "uuid";
import {PurchaseCreated} from "../../../../messages/events/modulePurchase/PurchaseCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";

export interface ModulePurchaseProperties {
    id: string;
    userId: string;
    moduleId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ModulePurchase extends AggregateRoot<ModulePurchaseProperties> {

    static restore(props: ModulePurchaseProperties) {
        return new ModulePurchase(props);
    }

    static createModulePurchase(payload: {
        userId: string;
        moduleId: string;
    }) {
        const {
            userId,
            moduleId,
        } = payload;

        const modulePurchase = new ModulePurchase({
            id: v4(),
            userId,
            moduleId,
        });

        modulePurchase.applyChange(
            new PurchaseCreated({
                id: modulePurchase.props.id,
                userId: modulePurchase.props.userId,
                moduleId: modulePurchase.props.moduleId,
                createdAt: modulePurchase.props.createdAt,
                updatedAt: modulePurchase.props.updatedAt
            })
        )

        return modulePurchase;
    }

    @Handle(PurchaseCreated)
    private applyPurchaseCreated(event: PurchaseCreated) {
        this.props.id = event.props.id;
        this.props.userId = event.props.userId;
        this.props.moduleId = event.props.moduleId;
        this.props.createdAt = event.props.createdAt;
        this.props.updatedAt = event.props.updatedAt;
    }
}