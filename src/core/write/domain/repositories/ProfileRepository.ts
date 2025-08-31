import {Profile} from "../aggregates/Profile";
import {UpdateUsernameInput} from "../../usecases/user/UpdateUsername";

export interface ProfileRepository {
    save(profile: Profile): Promise<void>;

    getById(id: string): Promise<Profile>;

    isUsernameExists(username: string): Promise<boolean>;

    updateUsername(payload: UpdateUsernameInput): Promise<Profile>;
}
