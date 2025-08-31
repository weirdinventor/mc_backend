import { AggregateRoot } from "../entities/AggregateRoot";

export interface UserBadgeProperties {
    id: string;
    userId: string;
    badgeId: string;
    earnedTimestamp: Date;
}

export class UserBadge extends AggregateRoot<UserBadgeProperties> {
    static restore(props: UserBadgeProperties) {
        return new UserBadge(props);
    }
}