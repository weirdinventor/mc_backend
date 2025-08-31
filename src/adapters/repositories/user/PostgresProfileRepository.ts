import {Profile} from "../../../core/write/domain/aggregates/Profile";
import {ProfileRepository} from "../../../core/write/domain/repositories/ProfileRepository";
import {ProfileEntityMapper} from "./mappers/ProfileEntityMapper";
import {ProfileEntity} from "../entities/ProfileEntity";
import {ProfileErrors} from "../../../core/write/domain/errors/ProfileErrors";
import {injectable} from "inversify";
import {UpdateUsernameInput} from "../../../core/write/usecases/user/UpdateUsername";

@injectable()
export class PostgresProfileRepository implements ProfileRepository {
    private _profileEntityMapper: ProfileEntityMapper

    constructor(
        private readonly entityManager: any
    ) {
        this._profileEntityMapper = new ProfileEntityMapper(this.entityManager)
    }


    async isUsernameExists(username: string): Promise<boolean> {
        const result = await this.entityManager.query(
            `SELECT * FROM profiles WHERE profiles.username = $1`, [username]
        )
        if (!result.length) {
            return false
        }
        return true
    }

    async save(profile: Profile): Promise<void> {
        const profileRepo = this.entityManager.getRepository(ProfileEntity)
        const profileEntity = this._profileEntityMapper.fromDomain(profile)
        await profileRepo.save(profileEntity)
    }


    async getById(id: string): Promise<Profile> {
        const profileRepo = this.entityManager.getRepository(ProfileEntity)
        const profileEntity = await profileRepo.findOne({
            where: {
                id
            }
        })
        if (!profileEntity) {
            throw new ProfileErrors.ProfileNotFound()
        }
        return this._profileEntityMapper.toDomain(profileEntity)
    }

    async updateUsername(payload: UpdateUsernameInput): Promise<Profile> {
        const profileRepo = this.entityManager.getRepository(ProfileEntity)
        const {username, id} = payload

        const profile = await profileRepo.findOne({
            where: {
                id
            }
        })

        if (!profile) {
            return null
        }

        profile.username = username
        const updatedProfile = await profileRepo.save(profile)

        return this._profileEntityMapper.toDomain(updatedProfile)
    }

}