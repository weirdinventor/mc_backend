import {DeviceErrors} from "../errors/DeviceErrors";

export class UniqueId {
  value : string
  constructor(registrationToken : string) {
    const tokenValidation: boolean = this.validToken(registrationToken)
    if (!tokenValidation) {
      //we need to check
      throw new DeviceErrors.InvalidDeviceToken()
    }
    this.value = registrationToken.split(':')[0]
  }
    validToken(registrationToken){
        return !!(registrationToken && registrationToken.includes(":"));
    }
}
