import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {UserErrors} from "../../domain/errors/UserErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {ConversationErrors} from "../../domain/errors/ConversationErrors";
import {ConversationRepository} from "../../domain/repositories/ConversationRepository";


export interface BlockUserInput {
    user: UserIdentity,
    userToBlockId: string
}

@injectable()
export class BlockUser implements Usecase<BlockUserInput, void> {

    constructor(
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        @inject(Identifiers.conversationRepository)
        private readonly _conversationRepository: ConversationRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }


    async execute(payload: BlockUserInput): Promise<void> {

        const {userToBlockId, user} = payload

        const loggedUser = await this._userRepository.getById(user.id)
        const isUserBlocked = await this._userRepository.isUserBlocked(user.id, userToBlockId)

        if (isUserBlocked) {
            throw new UserErrors.UserAlreadyBlocked();
        }

        const conversation = await this._conversationRepository.getConversationByOwner(user.id, userToBlockId);

        if (conversation) {
            const isConversationBlocked = await this._conversationRepository.isAlreadyBlocked(conversation.id);

            if (isConversationBlocked) {
                throw new ConversationErrors.ConversationAlreadyBlocked();
            }

            conversation.block({id: conversation.id});
            await this._conversationRepository.setAsBlocked(conversation.id);
            await this._eventDispatcher.dispatch(conversation);
        }


        loggedUser.blockUser({
            userId: user.id,
            userToBlockId
        })

        await this._userRepository.blockUser(user.id, userToBlockId)
        await this._eventDispatcher.dispatch(loggedUser)
    }

}