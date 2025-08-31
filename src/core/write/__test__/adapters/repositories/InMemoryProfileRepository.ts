import { ProfileRepository } from "../../../domain/repositories/ProfileRepository";
import { Profile } from "../../../domain/aggregates/Profile";
import { User } from "../../../domain/aggregates/User";
import { ProfileErrors } from "../../../domain/errors/ProfileErrors";
import {UpdateUsernameInput} from "../../../usecases/user/UpdateUsername";

export class InMemoryProfileRepository implements ProfileRepository {
  constructor(private readonly db: Map<string, Profile>) {}

  isUsernameExists(username: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

  async save(profile: Profile): Promise<void> {
    this.db.set(profile.id, profile);
  }

  async getById(id: string): Promise<Profile> {
    const profile = this.db.get(id);
    if (!profile) {
      throw new ProfileErrors.ProfileNotFound();
    }
    return profile;
  }
  updateUsername(payload: UpdateUsernameInput): Promise<Profile> {
    throw new Error("Method not implemented.");
  }
}
