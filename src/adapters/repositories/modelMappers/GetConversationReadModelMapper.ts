import {Mapper} from "../../../core/write/domain/models/Mapper";
import {ConversationReadModel} from "../../../core/read/models/ConversationReadModel";


export class GetConversationReadModelMapper implements Mapper<any, ConversationReadModel> {

    toDomain(raw: any): ConversationReadModel {
        if (!raw) return null
        return {
            id: raw.c_id,
            /*startedBy: {
                id: raw.sb_id,
                username: raw.sbp_username,
                email: raw.sb_email,
                profilePicture: raw.sbp_profilepicture,
                createdAt: raw.sb_createdat,
                updatedAt: raw.sb_updatedat
            },*/
            participant: {
                id: raw.participant.id,
                username: raw.participant.username,
                email: raw.participant.email,
                profilePicture: raw.participant.profilePicture,
                createdAt: raw.participant.createdAt,
                updatedAt: raw.participant.updatedAt
            },
            latestMessage: raw.c_latestmessage,
            createdAt: raw.c_createdat,
            updatedAt: raw.c_updatedat,
            isBlocked: raw.c_isblocked,
        }
    }
}