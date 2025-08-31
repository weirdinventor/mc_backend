import { AggregateRoot } from "../entities/AggregateRoot";
import { AccessLevel } from "../types/AccessLevel";
import { UserProperties } from "./User";

export interface GradeProperties {
    id: string;
    name: string;
    minXpRequired: number;
    userTypeAccess: AccessLevel;
    animationAssetUrl: string;
    users: UserProperties[];
}

export class Grade extends AggregateRoot<GradeProperties> {
    static restore(props: GradeProperties) {
        return new Grade(props);
    }
}
    