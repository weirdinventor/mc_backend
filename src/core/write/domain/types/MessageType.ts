import {Media} from "./MediaType";

export enum MessageType {
    TEXT = "text",
    MEDIA = "media",
    AUDIO = "audio",
}

export type Message = {
    text: string;
    media: Media[];
    audio: string;
    type: MessageType[];
}