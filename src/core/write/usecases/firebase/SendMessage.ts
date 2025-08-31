import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {ConversationGateway} from "../../domain/gateway/ConversationGateway";
import {Message, MessageType} from "../../domain/types/MessageType";
import {ConversationErrors} from "../../domain/errors/ConversationErrors";
import {ConversationRepository} from "../../domain/repositories/ConversationRepository";
import {
    PersonalInformationReadModelRepository
} from "../../../read/repositories/PersonalInformationReadModelRepository";
import {DeviceRepository} from "../../domain/repositories/DeviceRepository";
import {PushNotificationGateway} from "../../domain/gateway/PushNotificationGateway";
import {NotificationTypes} from "../../domain/types/NotificationTypes";
import {MessageParticipant} from "../../domain/types/MessageParticipant";

export interface SendMessageInput {
    message: Message;
    conversationId: string;
    senderId: string
}


@injectable()
export class SendMessage implements Usecase<SendMessageInput, void> {

    constructor(
        @inject(Identifiers.conversationGateway)
        private readonly _conversationGateway: ConversationGateway,
        @inject(Identifiers.conversationRepository)
        private readonly _conversationRepository: ConversationRepository,
        @inject(Identifiers.personalInformationReadModelRepository)
        private readonly _personalInformationReadModelRepository: PersonalInformationReadModelRepository,
        @inject(Identifiers.deviceRepository)
        private readonly _deviceRepository: DeviceRepository,
        @inject(Identifiers.pushNotificationGateway)
        private readonly _pushNotificationGateway: PushNotificationGateway
    ) {
    }

    async execute(payload: SendMessageInput): Promise<void> {
        const {message, conversationId, senderId} = payload
        const conversation = await this._conversationRepository.getById(conversationId)

        if (!conversation)
            throw new ConversationErrors.ConversationNotFound();

        if (conversation.props.isBlocked) {
            throw new ConversationErrors.ConversationBlocked();
        }

        const {text, audio, media, type} = message

        if (!text && !audio && !media)
            throw new ConversationErrors.CannotSendMessage();

        if (type.includes(MessageType.TEXT) && !text)
            throw new ConversationErrors.TextMessageCannotBeEmpty();

        if (type.includes(MessageType.MEDIA) && !media || (media && media.length === 0))
            throw new ConversationErrors.MediaCannotBeEmpty();

        if (type.includes(MessageType.AUDIO) && !audio)
            throw new ConversationErrors.AudioCannotBeEmpty();

        const userData = await this._personalInformationReadModelRepository.getById(senderId);

        const destination: string = conversation.props.startedBy === senderId ?
            conversation.props.participant :
            conversation.props.startedBy;

        const device = await this._deviceRepository.getById(destination);
        const participantData = await this._personalInformationReadModelRepository.getById(destination);

        const messageParticipant: MessageParticipant = {
            id: participantData.id,
            username: participantData.username,
            profilePicture: participantData.profilePicture,
            createdAt: new Date(participantData.createdAt)
        }

        await this._conversationGateway.sendMessage({
            senderId,
            conversationId,
            message: {
                ...message,
                username: userData.username,
                profilePicture: userData.profilePicture
            }
        })

        if (device) {
            await this._pushNotificationGateway.send({
                registrationToken: device.props.registrationToken,
                notification: {
                    title: "Moula Club",
                    body: `New message from ${userData.username}`
                },
                data: {
                    type: NotificationTypes.NEW_MESSAGE,
                    participant: JSON.stringify(messageParticipant),
                    conversationId: conversationId
                }
            })
        }

        await this._conversationRepository.saveLastMessage(payload.conversationId, message)
    }

}
