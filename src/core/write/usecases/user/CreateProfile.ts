import { inject, injectable } from "inversify";
import { Profile } from "../../domain/aggregates/Profile";
import { Usecase } from "../../domain/models/Usecase";
import { Identifiers } from "../../../Identifiers";
import { EventDispatcher } from "../../../../adapters/services/EventDispatcher";
import { ProfileRepository } from "../../domain/repositories/ProfileRepository";
import { UserIdentity } from "../../domain/entities/UserIdentity";
import { UserRole } from "../../domain/types/UserRole";
import {UserGender} from "../../domain/types/UserGender";

export interface CreateProfileInput {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  gender : UserGender;
}

@injectable()
export class CreateProfile implements Usecase<CreateProfileInput, Profile> {
  constructor(
    @inject(Identifiers.profileRepository)
    private readonly profileRepository: ProfileRepository,
    @inject(EventDispatcher)
    private readonly eventDispatcher: EventDispatcher
  ) {}

  async execute(request: CreateProfileInput): Promise<Profile> {
    const { id, firstname, lastname, username, gender } = request;
    const profile = Profile.create({
      id,
      firstname,
      lastname,
      username,
      gender
    });
    await this.profileRepository.save(profile);
    await this.eventDispatcher.dispatch(profile);
    return profile;
  }

  async canExecute(
    identity: UserIdentity,
    request?: CreateProfileInput
  ): Promise<boolean> {
    return identity.id === request.id;
  }
}
