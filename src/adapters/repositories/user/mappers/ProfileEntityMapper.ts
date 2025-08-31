import {ProfileEntity} from "../../entities/ProfileEntity";
import {Profile} from "../../../../core/write/domain/aggregates/Profile";
import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {EntityManager} from "typeorm";

export class ProfileEntityMapper implements Mapper<ProfileEntity, Profile> {
    constructor(private readonly entityManager: EntityManager) {
    }

    fromDomain(param: Profile): ProfileEntity {
        return this.entityManager.create(ProfileEntity, {
            id: param.id,
            firstName: param.props.firstname,
            lastName: param.props.lastname,
            username: param.props.username,
            profilePicture: param.props.profilePicture,
            gender: param.props.gender,
            createdAt: param.createdAt,
            updatedAt: param.updatedAt,
        });
    }

    toDomain(raw: ProfileEntity): Profile {
        const profile = Profile.restore({
            id: raw.id,
            firstname: raw.firstName,
            lastname: raw.lastName,
            username: raw.username,
            profilePicture: raw.profilePicture,
            gender: raw.gender,
        });
        profile.createdAt = raw.createdAt;
        profile.updatedAt = raw.updatedAt;
        return profile;
    }
}
