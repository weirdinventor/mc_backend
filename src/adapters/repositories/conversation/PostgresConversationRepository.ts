import {ConversationRepository} from "../../../core/write/domain/repositories/ConversationRepository";
import {ConversationEntityMapper} from "./mappers/ConversationEntityMapper";
import {EntityManager} from "typeorm";
import {Conversation} from "../../../core/write/domain/aggregates/Conversation";
import {ConversationEntity} from "../entities/ConversationEntity";
import {
    GetConversationsInput,
    GetConversationsOutput
} from "../../../core/write/usecases/conversation/GetConversations";
import {CreateConversationOutput} from "../../../core/write/usecases/conversation/CreateConversation";
import {Message} from "../../../core/write/domain/types/MessageType";
import {IsConversationExistInput} from "../../../core/write/usecases/conversation/IsConversationExist";


export class PostgresConversationRepository implements ConversationRepository {

    private readonly conversationEntityMapper: ConversationEntityMapper;

    constructor(
        private readonly entityManager: EntityManager
    ) {
        this.conversationEntityMapper = new ConversationEntityMapper(this.entityManager);
    }

    async getById(id: string): Promise<Conversation> {
        const conversationRepo = this.entityManager.getRepository(ConversationEntity);

        const conversation = await conversationRepo.findOne({where: {id}})

        if (!conversation) return null

        return this.conversationEntityMapper.toDomain(conversation);
    }


    async getConversations(payload: GetConversationsInput): Promise<GetConversationsOutput> {
        const conversationRepo = this.entityManager.getRepository(ConversationEntity);

        const {userId, take, skip} = payload;

        const [conversations, count] = await conversationRepo.findAndCount({
            where: [
                {startedBy: userId},
                {participant: userId}
            ],
            take,
            skip
        })

        return {
            conversations: conversations.map((conversation) =>
                this.conversationEntityMapper.toDomain(conversation)),
            count
        }
    }

    async getConversationByOwner(ownerId: string, userToBlockId: string): Promise<Conversation> {
        const conversationRepo = this.entityManager.getRepository(ConversationEntity);

        const conversation = await conversationRepo.findOne({
            where: [
                {startedBy: ownerId, participant: userToBlockId},
                {startedBy: userToBlockId, participant: ownerId}
            ]
        })

        if (!conversation) return null

        return this.conversationEntityMapper.toDomain(conversation);
    }


    async createConversation(conversation: Conversation): Promise<CreateConversationOutput> {
        const conversationRepo = this.entityManager.getRepository(ConversationEntity);
        const conversationEntity = this.conversationEntityMapper.fromDomain(conversation);

        const isAlreadyExist = await conversationRepo.findOne({
            where: [
                {startedBy: conversationEntity.startedBy, participant: conversationEntity.participant},
                {startedBy: conversationEntity.participant, participant: conversationEntity.startedBy}
            ]
        })

        if (isAlreadyExist) {
            return {
                conversation: this.conversationEntityMapper.toDomain(isAlreadyExist),
                exist: true
            }
        }

        const savedConversation = await conversationRepo.save(conversationEntity)

        return {
            conversation: this.conversationEntityMapper.toDomain(savedConversation),
            exist: false
        }
    }

    async saveLastMessage(id: string, conversation: Message): Promise<void> {
        const conversationRepo = this.entityManager.getRepository(ConversationEntity);

        await conversationRepo.update(id, {
            latestMessage: conversation
        })
    }

    async isConversationExist(payload: IsConversationExistInput): Promise<Conversation> {
        const conversationRepo = this.entityManager.getRepository(ConversationEntity);
        const {receiverId, senderId} = payload;

        const conversation = await conversationRepo.findOne({
            where: [
                {startedBy: senderId, participant: receiverId},
                {startedBy: receiverId, participant: senderId}
            ]
        })


        if (!conversation) {
            return null;
        }

        return this.conversationEntityMapper.toDomain(conversation);
    }

    async deleteConversation(conversationId: string): Promise<void> {
        const conversationRepo = this.entityManager.getRepository(ConversationEntity);

        const conversation = await conversationRepo.findOne({
            where: {
                id: conversationId
            }
        })

        await conversationRepo.remove(conversation)
    }

    async setAsBlocked(conversationId: string): Promise<void> {
        const conversationRepo = this.entityManager.getRepository(ConversationEntity);

        await conversationRepo.update(conversationId, {
            isBlocked: true
        })
    }

    async isAlreadyBlocked(conversationId: string): Promise<boolean> {

        const conversationRepo = this.entityManager.getRepository(ConversationEntity);

        const conversation = await conversationRepo.findOne({
            where: {
                id: conversationId
            }
        })

        return conversation.isBlocked;

    }
}