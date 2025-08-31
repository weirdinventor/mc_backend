import {ProfileRepository} from "../domain/repositories/ProfileRepository";
import {CreateProfile} from "../usecases/user/CreateProfile";
import {InMemoryProfileRepository} from "./adapters/repositories/InMemoryProfileRepository";
import {eventDispatcherMock} from "./adapters/gateways/EventDispatcherMock";
import {Profile} from "../domain/aggregates/Profile";
import {UserGender} from "../domain/types/UserGender";

describe("Unit - CreateProfile", () => {
  let createProfile: CreateProfile;
  let profileRepository: ProfileRepository;

  beforeAll(async () => {
    profileRepository = new InMemoryProfileRepository(
      new Map<string, Profile>()
    );
    createProfile = new CreateProfile(profileRepository, eventDispatcherMock());
  });

  it("should create a profile", async () => {
    const profile = await createProfile.execute({
      id: "1",
      firstname: "John",
      lastname: "Doe",
      username: "johndoe",
      gender: UserGender.FEMALE
    });
    expect(profile.props.firstname).toEqual("John");
    expect(profile.props.lastname).toEqual("Doe");
  });
});
