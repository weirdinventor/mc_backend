import {UserIdentity} from "../../../core/write/domain/entities/UserIdentity";

export const mockIdentityRequest = (identity: UserIdentity) => {
  return {
    identity: identity
  }
}
