import {Message} from "../../domain/types/MessageType";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {ConversationGroupGateway} from "../../domain/gateway/ConversationGroupGateway";
import {
    PersonalInformationReadModelRepository
} from "../../../read/repositories/PersonalInformationReadModelRepository";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {GamificationConstants} from "../../domain/types/GamificationConstants";
import {GamificationService} from "../../../../adapters/services/GamificationService";
import {MessageType} from "../../domain/types/MessageType";


export interface SendGroupMessageInput {
    senderId: string;
    message: Message;
    conversationId: string;
}


@injectable()
export class SendGroupMessage implements Usecase<SendGroupMessageInput, void> {

    constructor(
        @inject(Identifiers.conversationGroupGateway)
        private readonly _conversationGroupGateway: ConversationGroupGateway,
        @inject(Identifiers.personalInformationReadModelRepository)
        private readonly _personalInformationReadModelRepository: PersonalInformationReadModelRepository,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
        @inject(Identifiers.gamificationService)
        private readonly _gamificationService: GamificationService
    ) {
    }

    async execute(payload: SendGroupMessageInput): Promise<void> {
        const {senderId, message, conversationId} = payload

        const conversation = await this._groupRepository.getGroupOrModuleById(conversationId)

        if (!conversation)
            throw new GroupErrors.GroupNotFound("GROUP_OR_MODULE_NOT_FOUND");


        const isMember = await this._groupRepository.isUserMemberOfGroup({
            groupId: conversationId,
            userId: senderId
        });

        if (!isMember) {
            throw new GroupErrors.GroupMemberNotFound();
        }

        const userData = await this._personalInformationReadModelRepository.getById(senderId);

        await this._conversationGroupGateway.sendMessage({
            senderId,
            conversationId,
            message: {
                ...message,
                username: userData.username,
                profilePicture: userData.profilePicture,
                createdAt: new Date(userData.createdAt)
            }
        });
        // Gamification
        const xpPoints = message.type.includes(MessageType.MEDIA) ? 2 : 1;
        await this._gamificationService.awardXp(senderId, xpPoints);


        if (conversation.props.isModule) {
            const messageCount = await this._gamificationService.incrementModuleMessageCount(senderId, conversationId);
            if (messageCount >= GamificationConstants.MODULE_EXPERT_CONTRIBUTOR_MESSAGE_THRESHOLD) {
                await this._gamificationService.awardModuleExpertContributorBadge(senderId, conversationId);
                // TODO Send a special notification for user to show that he earned a new badge
            }
        }


    }
}