import {DomainError} from "./DomainError";


export namespace ConversationErrors {
    export class ConversationNotFound extends DomainError {
        constructor(message?: string) {
            super(message ?? 'CONVERSATION_NOT_FOUND');
            this.httpCode = 404
        }
    }


    export class ConversationAlreadyExists extends DomainError {
        constructor(message?: string) {
            super(message ?? 'CONVERSATION_ALREADY_EXISTS');
            this.httpCode = 400
        }
    }

    export class CannotSendMessage extends DomainError {
        constructor(message?: string) {
            super(message ?? 'CANNOT_SEND_MESSAGE');
            this.httpCode = 400
        }
    }

    export class TextMessageCannotBeEmpty extends DomainError {
        constructor(message?: string) {
            super(message ?? 'TEXT_MESSAGE_CANNOT_BE_EMPTY');
            this.httpCode = 400
        }
    }

    export class MediaCannotBeEmpty extends DomainError {
        constructor(message?: string) {
            super(message ?? 'MEDIA_CANNOT_BE_EMPTY');
            this.httpCode = 400
        }
    }

    export class AudioCannotBeEmpty extends DomainError {
        constructor(message?: string) {
            super(message ?? 'AUDIO_CANNOT_BE_EMPTY');
            this.httpCode = 400
        }
    }

    export class ConversationAlreadyBlocked extends DomainError {
        constructor(message?: string) {
            super(message ?? 'CONVERSATION_ALREADY_BLOCKED');
            this.httpCode = 400
        }
    }

    export class ConversationBlocked extends DomainError {
        constructor(message?: string) {
            super(message ?? 'CONVERSATION_BLOCKED');
            this.httpCode = 400
        }
    }
}