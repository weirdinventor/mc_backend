import {EventManager} from "../../../messages/utilsAndConfugrations/eventsConfig/EventManager";
import {UserSignedUp} from "../../../messages/events/UserSignedUp";
import {HandleUserSignedUp} from "./HandleUserSignedUp";
import {SendAccountActivationEmailEvent} from "../../../messages/events/SendAccountActivationEmailEvent";
import {HandleSendAccountActivationEmailEvent} from "./HandleSendAccountActivationEmailEvent";
import {HandleProfileActivatedEvent} from "./HandleProfileActivatedEvent";
import {ProfileCreated} from "../../../messages/events/ProfileCreated";
import {HandleRecoveryCodeGeneratedEvent} from "./HandleRecoveryCodeGeneratedEvent";
import {RecoveryCodeGenerated} from "../../../messages/events/RecoveryCodeGenerated";


export class HandlersModule {

  static configureHandlers(eventManager: EventManager) {
    eventManager.register(UserSignedUp, HandleUserSignedUp);
    eventManager.register(SendAccountActivationEmailEvent, HandleSendAccountActivationEmailEvent)
    eventManager.register(ProfileCreated, HandleProfileActivatedEvent)
    eventManager.register(RecoveryCodeGenerated, HandleRecoveryCodeGeneratedEvent)
  }
}
