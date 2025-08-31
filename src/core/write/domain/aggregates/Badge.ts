import { v4 } from "uuid";
import { AggregateRoot } from "../entities/AggregateRoot";
import { BadgeCreated } from "../../../../messages/events/badge/BadgeCreated";
import { Handle } from "../../../../messages/utilsAndConfugrations/decorators/Handle";

export interface BadgeProperties {
    id: string;
    name: string;
    description?: string;
    badgeType: 'Module_Expert_Contributor' | 'Special' | 'Achievement' | 'Skill' | 'Community';
    pictureUrl?: string;
}

export class Badge extends AggregateRoot<BadgeProperties> {
    static restore(props: BadgeProperties) {
        return new Badge(props);
    }

    static createBadge(props: {
        name: string;
        description?: string;
        badgeType: 'Module_Expert_Contributor' | 'Special' | 'Achievement' | 'Skill' | 'Community';
        pictureUrl?: string;
    }) {
        const { name, description, badgeType, pictureUrl } = props;
        const badge = new Badge({
            id: v4(),
            name,
            description,
            badgeType,
            pictureUrl
        });

        badge.applyChange(
            new BadgeCreated({
                id: badge.props.id,
                name,
                description,
                badgeType,
                pictureUrl
            })
        );

        return badge;
    }

    @Handle(BadgeCreated)
    private applyBadgeCreated(event: BadgeCreated) {
        this.props.id = event.props.id;
        this.props.name = event.props.name;
        this.props.description = event.props.description;
        this.props.badgeType = event.props.badgeType;
        this.props.pictureUrl = event.props.pictureUrl;
    }
}
